import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { OrdersModule } from '../orders/orders.module'; // 추가

@Module({
  imports: [
    PrismaModule,
    OrdersModule
  ],
  controllers: [SignalsController],
  providers: [SignalsService],
})
export class SignalsModule { }