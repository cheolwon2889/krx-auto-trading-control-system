import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SignalsModule } from './signals/signals.module';

@Module({
  imports: [PrismaModule, SignalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
