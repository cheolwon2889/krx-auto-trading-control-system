import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SignalsService, type SignalsWebhookPayload } from './signals.service';
import { OrdersService } from '../orders/orders.service';

describe('SignalsService', () => {
  let service: SignalsService;

  const tradingSystemSettingFindFirst = jest.fn<
    Promise<{ tradingEnabled: boolean; stopReason: string | null } | null>,
    [Record<string, unknown>]
  >();

  const tradingSignalFindUnique = jest.fn<
    Promise<{ id: string } | null>,
    [{ where: { eventId: string }; select: { id: true } }]
  >();

  const strategyFindUniqueOrThrow = jest.fn<
    Promise<{ id: string }>,
    [{ where: { code: string }; select: { id: true } }]
  >();

  const tradingSignalCreate = jest.fn<
    Promise<{ id: string }>,
    [{ data: Record<string, unknown> }]
  >();

  const ordersServiceCreateOrder = jest.fn();

  const prismaMock = {
    strategy: {
      findUniqueOrThrow: strategyFindUniqueOrThrow,
    },
    tradingSignal: {
      create: tradingSignalCreate,
      findUnique: tradingSignalFindUnique,
    },
    tradingSystemSetting: {
      findFirst: tradingSystemSettingFindFirst,
    },
  };

  const ordersServiceMock = {
    createOrder: ordersServiceCreateOrder,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: OrdersService, useValue: ordersServiceMock },
      ],
    }).compile();
    service = module.get(SignalsService);
  });

  // 각 테스트 케이스가 실행되기 전에 항상 모크 함수의 상태와 값을 초기화해 줍니다.
  beforeEach(() => {
    // mockReset()은 호출 횟수와 반환값 설정을 모두 완전 초기 상태로 돌립니다.
    strategyFindUniqueOrThrow.mockReset();
    tradingSignalCreate.mockReset();
    tradingSystemSettingFindFirst.mockReset();
    tradingSignalFindUnique.mockReset();
    ordersServiceCreateOrder.mockReset();

    // 모크 반환값 정의
    strategyFindUniqueOrThrow.mockResolvedValue({ id: 'strategy-1' });
    tradingSignalCreate.mockResolvedValue({ id: 'signal-1' });
    tradingSystemSettingFindFirst.mockResolvedValue({ tradingEnabled: true, stopReason: null });
    tradingSignalFindUnique.mockResolvedValue(null);
    ordersServiceCreateOrder.mockResolvedValue({ id: 'order-1' });
  });

  it('should persist webhook payload with prisma.tradingSignal.create', async () => {
    const payload: SignalsWebhookPayload = {
      eventId: 'tv-001',
      strategyCode: 'mean-reversion',
      symbol: '005930',
      exchange: 'KRX',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: '10',
    };

    await expect(service.receiveWebhook(payload)).resolves.toEqual({
      status: 'accepted',
    });

    expect(strategyFindUniqueOrThrow).toHaveBeenCalledWith({
      where: { code: 'mean-reversion' },
      select: { id: true },
    });

    expect(tradingSignalCreate).toHaveBeenCalledWith({
      data: {
        eventId: 'tv-001',
        strategyId: 'strategy-1',
        symbol: '005930',
        exchange: 'KRX',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: '10',
        price: null,
        rawPayload: payload,
      },
    });
  });

  it('should ignore duplicate webhooks (idempotency)', async () => {
    tradingSignalFindUnique.mockResolvedValue({ id: 'signal-existing' });

    const payload: SignalsWebhookPayload = {
      eventId: 'tv-duplicate',
      strategyCode: 'mean-reversion',
      symbol: '005930',
      exchange: 'KRX',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: '10',
    };

    await expect(service.receiveWebhook(payload)).resolves.toEqual({
      status: 'ignored',
    });

    expect(tradingSignalCreate).not.toHaveBeenCalled();
  });

  it('should reject webhooks when trading is disabled in DB (emergency stop)', async () => {
    tradingSystemSettingFindFirst.mockResolvedValue({
      tradingEnabled: false,
      stopReason: 'Emergency stop triggered by DB settings',
    });

    const payload: SignalsWebhookPayload = {
      eventId: 'tv-disabled',
      strategyCode: 'mean-reversion',
      symbol: '005930',
      exchange: 'KRX',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: '10',
    };

    await expect(service.receiveWebhook(payload)).rejects.toThrow(
      'Trading is disabled in DB settings'
    );
  });
});