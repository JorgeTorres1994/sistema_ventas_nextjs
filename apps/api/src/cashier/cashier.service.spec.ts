import { Test, TestingModule } from '@nestjs/testing';
import { CashierService } from './cashier.service';
import { PrismaService } from '../prisma.service';

describe('CashierService', () => {
  let service: CashierService;

  const mockPrisma = {
    cashRegister: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashierService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CashierService>(CashierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
