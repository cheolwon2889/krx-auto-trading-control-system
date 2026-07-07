import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';

@Module({
  imports: [PrismaModule],
  controllers: [SignalsController],
  providers: [SignalsService],
})
export class SignalsModule {}