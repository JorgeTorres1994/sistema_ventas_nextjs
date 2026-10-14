import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma.service';

describe('InventoryService - Weighted Average Cost & Adjustments', () => {
  let service: InventoryService;

  const mockPrisma: any = {
    $transaction: jest.fn((callback) => callback(mockTx)),
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { stock: 0 } }),
    },
  };

  const mockTx: any = {
    product: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'p-1',
        name: 'Camisa',
        stock: 10,
        purchasePrice: 20,
      }),
      update: jest.fn().mockResolvedValue({ id: 'p-1', stock: 15, purchasePrice: 22 }),
    },
    stockMovement: {
      create: jest.fn().mockResolvedValue({ id: 'mov-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate new weighted average cost on stock IN adjustment', async () => {
    // Current: 10 units at 20 = 200
    // Incoming: 5 units at 26 = 130
    // Total Value: 330 / 15 units = 22 unit cost
    const res = await service.adjustStock({
      productId: 'p-1',
      quantity: 5,
      type: 'IN',
      unitCost: 26,
    });

    expect(res).toBeDefined();
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 'p-1' },
      data: {
        stock: 15,
        purchasePrice: 22,
      },
    });
  });
});
