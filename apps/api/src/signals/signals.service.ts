import * as fs from 'fs';
import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { OrderSide, OrderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service'; // 추가

export type SignalsWebhookPayload = Readonly<{
  eventId: string;
  strategyCode: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: string;
  price?: string;
}>;

export type SignalsWebhookResponse = Readonly<{
  status: 'accepted' | 'ignored';
}>;

@Injectable()
export class SignalsService {
  // 로거 인스턴스 생성
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly ordersService: OrdersService, // 추가
  ) { }

  async receiveWebhook(
    payload: SignalsWebhookPayload,
  ): Promise<SignalsWebhookResponse> {
    await this.checkEmeregencyStop();

    const isDuplicate = await this.checkIdempotency(payload.eventId);

    if (isDuplicate) {
      this.logger.warn(`Duplicate event received and bypassed : ${payload.eventId}`);
      return { status: 'ignored' };
    }

    const strategy = await this.prismaService.strategy.findUniqueOrThrow({
      where: { code: payload.strategyCode },
      select: { id: true },
    });

    const signal = await this.prismaService.tradingSignal.create({
      data: {
        eventId: payload.eventId,
        strategyId: strategy.id,
        symbol: payload.symbol,
        exchange: payload.exchange,
        side: payload.side,
        orderType: payload.orderType,
        quantity: payload.quantity,
        price: payload.price ?? null,
        rawPayload: payload,
      },
    });

    // 추가: 저장된 신호를 바탕으로 실제 주문(Order)을 생성하고 상태이력을 기록.
    await this.ordersService.createOrder(signal.id);

    return { status: 'accepted' };
  }
  // 동일한 eventId가 이미 처리되었는지 체크
  private async checkIdempotency(eventId: string): Promise<boolean> {
    const existingSignal = await this.prismaService.tradingSignal.findUnique({
      where: { eventId },
      select: { id: true },
    });
    return !!existingSignal;
  }

  // DB 상태 및 로컬 정지 파일 여부를 판단해 긴급정지 모드일 경우 에러를 던집니다.
  private async checkEmeregencyStop(): Promise<void> {
    // 1. 로컬 긴급 정지 파일 존재 여부 검사
    const stopFilePath = process.env.STOP_FILE_PATH || 'C:/auto-trading/STOP_TRADING';

    if (fs.existsSync(stopFilePath)) {
      this.logger.error(`Trading is stopped by local file : ${stopFilePath}`);
      throw new ServiceUnavailableException('Trading is temporarily stopped by local file.');
    }

    // 2. DB의 모든 전략에서 isSuspended 가 true 인지 확인
    const setting = await this.prismaService.tradingSystemSetting.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { tradingEnabled: true, stopReason: true },
    });

    if (setting && !setting.tradingEnabled) {
      this.logger.error(`Trading is disabled in DB settings. Reason: ${setting.stopReason || 'No reason specified'}`);
      throw new ServiceUnavailableException(
        `Trading is disabled in DB settings. Reason: ${setting.stopReason || 'None'}`
      );
    }
  }
}