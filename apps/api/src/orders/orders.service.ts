import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderSide, OrderType, OrderStatus } from '@prisma/client';
import { randomUUID } from 'crypto'; // uuid 패키지 대신 Node.js 기본 모듈 사용!

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(private readonly prismaService: PrismaService) { }

    generateClientOrderId(): string {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const uniqueId = randomUUID().split('-')[0]; // uuid의 앞 8자리 추출
        return `ORD-${dateStr}-${uniqueId}`;
    }

    // 트레이딩 신호(TradingSignal)를 바탕으로 신규 주문(Order)을 생성
    async createOrder(signalId: string): Promise<Order> {
        const signal = await this.prismaService.tradingSignal.findUniqueOrThrow({
            where: {
                id: signalId
            }
        })

        const clientOrderId = this.generateClientOrderId();

        return this.prismaService.$transaction(async (tx) => {
            // 1. order 테이블에 신규 주문 생성
            const order = await tx.order.create({
                data: {
                    clientOrderId,
                    signalId: signal.id,
                    strategyId: signal.strategyId,
                    symbol: signal.symbol,
                    exchange: signal.exchange,
                    side: signal.side,
                    orderType: signal.orderType,
                    requestedQty: signal.quantity,
                    requestedPrice: signal.price,
                    status: OrderStatus.RECEIVED //초기상태
                },
            });

            await tx.tradingSignal.update({
                where: { id: signal.id },
                data: {
                    status: 'ORDER_CREATED',
                }
            });

            this.logger.log(`Order created successfully: ${order.clientOrderId} for signal: ${signal.eventId}`);

            return order;
        })
    }
}
