import { Injectable } from '@nestjs/common';
import { OrderSide, OrderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
  status: 'accepted';
}>;

@Injectable()
export class SignalsService {
  constructor(private readonly prismaService: PrismaService) {}

  async receiveWebhook(
    payload: SignalsWebhookPayload,
  ): Promise<SignalsWebhookResponse> {
    const strategy = await this.prismaService.strategy.findUniqueOrThrow({
      where: { code: payload.strategyCode },
      select: { id: true },
    });

    await this.prismaService.tradingSignal.create({
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

    return { status: 'accepted' };
  }
}