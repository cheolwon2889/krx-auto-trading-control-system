import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Signals webhook (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /signals/webhook should accept payload', async () => {
    await request(app.getHttpServer())
      .post('/signals/webhook')
      .send({
        eventId: 'tv-001',
        symbol: '005930',
        side: 'BUY',
      })
      .expect(202)
      .expect({ status: 'accepted' });
  });
});
