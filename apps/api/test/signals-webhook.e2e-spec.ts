import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Signals webhook (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);

    await prismaService.strategy.create({
      data: {
        code: 'mean-reversion',
        name: 'Mean Reversion',
        description: 'Test strategy',
      },
    });
  });

  afterEach(async () => {
    await prismaService.tradingSignal.deleteMany({
      where: { eventId: 'tv-001' },
    });

    await prismaService.strategy.deleteMany({
      where: { code: 'mean-reversion' },
    });

    await app.close();
  });

  it('POST /signals/webhook should accept and persist payload', async () => {
    await request(app.getHttpServer())
      .post('/signals/webhook')
      .send({
        eventId: 'tv-001',
        strategyCode: 'mean-reversion',
        symbol: '005930',
        exchange: 'KRX',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: '10',
      })
      .expect(202)
      .expect({ status: 'accepted' });
  });
});