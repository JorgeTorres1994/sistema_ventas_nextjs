import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service.js';
import { PrismaService } from '../prisma.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: any;

  const mockPrisma = {
    expense: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cashRegister: {
      findUnique: jest.fn(),
    },
    cashMovement: {
      create: jest.fn(),
    },
    expenseCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should parse YYYY-MM-DD date string to valid Date object and create expense', async () => {
      mockPrisma.cashRegister.findUnique.mockResolvedValue({
        id: 'box-1',
        status: 'OPEN',
      });
      mockPrisma.expense.create.mockResolvedValue({
        id: 'exp-1',
        description: 'Papel térmico',
        amount: 35.0,
        date: new Date('2026-10-14'),
        categoryId: 'cat-1',
      });
      mockPrisma.cashMovement.create.mockResolvedValue({ id: 'mov-1' });

      const result = await service.create({
        description: 'Papel térmico',
        amount: 35.0,
        date: '2026-10-14',
        categoryId: 'cat-1',
        cashRegisterId: 'box-1',
        paymentMethod: 'CASH',
      });

      expect(mockPrisma.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'Papel térmico',
            amount: 35.0,
            date: expect.any(Date),
            category: { connect: { id: 'cat-1' } },
            cashRegister: { connect: { id: 'box-1' } },
          }),
        }),
      );
      expect(mockPrisma.cashMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cashRegisterId: 'box-1',
            type: 'OUT',
            amount: 35.0,
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if cash register is not OPEN', async () => {
      mockPrisma.cashRegister.findUnique.mockResolvedValue({
        id: 'box-closed',
        status: 'CLOSED',
      });

      await expect(
        service.create({
          description: 'Gasto no permitido',
          amount: 50.0,
          date: '2026-10-14',
          categoryId: 'cat-1',
          cashRegisterId: 'box-closed',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if expense does not exist', async () => {
      mockPrisma.expense.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
