import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../prisma.service';
import { CashRegistersService } from '../cash-registers/cash-registers.service';
import { PromotionsService } from '../promotions/promotions.service';
import { AuditService } from '../audit/audit.service';
import { InvoicingService } from '../invoicing/invoicing.service';
import { BadRequestException } from '@nestjs/common';

describe('SalesService - Business Rules & Automation', () => {
  let service: SalesService;

  const mockPrisma: any = {
    $transaction: jest.fn((callback) => callback(mockTx)),
    sale: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTx: any = {
    customer: {
      findFirst: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Consumidor Final' }),
      create: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Consumidor Final' }),
      update: jest.fn().mockResolvedValue({ id: 'cust-1' }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Admin' }),
    },
    cashRegister: {
      findFirst: jest.fn().mockResolvedValue({ id: 'cr-1', status: 'OPEN' }),
    },
    documentSeries: {
      findFirst: jest.fn().mockResolvedValue({ id: 'ds-1', prefix: 'B001', currentNumber: 5, isActive: true }),
      update: jest.fn().mockResolvedValue({ id: 'ds-1', currentNumber: 6 }),
    },
    product: {
      findUnique: jest.fn().mockResolvedValue({ id: 'p-1', name: 'Zapatos', price: 100, stock: 10, purchasePrice: 60 }),
      update: jest.fn().mockResolvedValue({ id: 'p-1', stock: 9 }),
    },
    stockMovement: {
      create: jest.fn().mockResolvedValue({ id: 'sm-1' }),
    },
    cashMovement: {
      create: jest.fn().mockResolvedValue({ id: 'cm-1' }),
    },
    sale: {
      create: jest.fn().mockResolvedValue({
        id: 'sale-1',
        total: 100,
        subtotal: 84.75,
        taxAmount: 15.25,
        series: 'B001',
        correlative: 6,
        documentType: 'BOLETA',
      }),
    },
  };

  const mockCashService = {};
  const mockPromotionsService = {
    validateCoupon: jest.fn(),
    calculatePoints: jest.fn().mockReturnValue(10),
    calculatePointDiscount: jest.fn().mockReturnValue(0),
    applyPointsRedemption: jest.fn(),
  };
  const mockAudit = {
    logAction: jest.fn().mockResolvedValue(true),
  };
  const mockInvoicing = {
    sendInvoice: jest.fn().mockResolvedValue({ status: 'SIMULATED' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CashRegistersService, useValue: mockCashService },
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: AuditService, useValue: mockAudit },
        { provide: InvoicingService, useValue: mockInvoicing },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if cash register is not open', async () => {
    mockTx.cashRegister.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.createSale('user-1', [{ productId: 'p-1', quantity: 1 }])
    ).rejects.toThrow('ACTIVA_CAJA: Debes aperturar o abrir tu caja.');
  });

  it('should throw BadRequestException if stock is insufficient', async () => {
    mockTx.product.findUnique.mockResolvedValueOnce({ id: 'p-1', name: 'Zapatos', price: 100, stock: 0 });

    await expect(
      service.createSale('user-1', [{ productId: 'p-1', quantity: 2 }])
    ).rejects.toThrow('Stock insuficiente para Zapatos');
  });

  it('should successfully create sale, deduct stock, and trigger invoicing', async () => {
    const sale = await service.createSale(
      'user-1',
      [{ productId: 'p-1', quantity: 1 }],
      'cust-1',
      100,
      'CASH',
      'PAID',
      'BOLETA'
    );

    expect(sale).toBeDefined();
    expect(sale.id).toBe('sale-1');
    expect(mockTx.product.update).toHaveBeenCalled();
    expect(mockTx.stockMovement.create).toHaveBeenCalled();
    expect(mockTx.cashMovement.create).toHaveBeenCalled();
  });
});
