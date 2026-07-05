import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const appService: Pick<AppService, 'getHello' | 'getDatabaseHealth'> = {
      getHello: () => 'Hello World!',
      getDatabaseHealth: async () => ({ status: 'ok' as const }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('dbHealth', () => {
    it('should return an ok status payload', async () => {
      await expect(appController.dbHealth()).resolves.toEqual({ status: 'ok' });
    });
  });
});
