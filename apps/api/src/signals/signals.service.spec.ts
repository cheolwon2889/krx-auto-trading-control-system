import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SignalsService, type SignalsWebhookPayload } from './signals.service';

describe('SignalsService', () => {
  let service: SignalsService;

  const strategyFindUniqueOrThrow = jest.fn<
    Promise<{ id: string }>,
    [{ where: { code: string }; select: { id: true } }]
  >();

  const tradingSignalCreate = jest.fn<
    Promise<{ id: string }>,
    [{ data: Record<string, unknown> }]
  >();

  const prismaMock = {
    strategy: {
      findUniqueOrThrow: strategyFindUniqueOrThrow,
    },
    tradingSignal: {
      create: tradingSignalCreate,
    },
  };

  beforeEach(async () => {
    strategyFindUniqueOrThrow.mockResolvedValue({ id: 'strategy-1' });
    tradingSignalCreate.mockResolvedValue({ id: 'signal-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(SignalsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
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
});