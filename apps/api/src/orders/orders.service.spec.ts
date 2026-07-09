import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  // PrismaService 모킹 객체 생성
  const prismaMock = {
    tradingSignal: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prismaMock)), // 트랜잭션 호출 시 콜백 즉시 실행되게 설정
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
