import { Test, TestingModule } from '@nestjs/testing';
import { CashRegistersService } from './cash-registers.service';
import { PrismaService } from '../prisma.service';

describe('CashRegistersService', () => {
  let service: CashRegistersService;

  const mockPrisma = {
    cashRegister: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'cr-1', status: 'OPEN', openingBalance: 100 }),
      update: jest.fn().mockResolvedValue({ id: 'cr-1', status: 'CLOSED' }),
    },
    cashMovement: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'cm-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashRegistersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CashRegistersService>(CashRegistersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should open register successfully when none is open', async () => {
    mockPrisma.cashRegister.findFirst.mockResolvedValueOnce(null);
    const register = await service.openRegister('user-1', 100, 'Opening note');
    expect(register.id).toBe('cr-1');
    expect(register.status).toBe('OPEN');
  });
});
