import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', name: 'Test Product', price: 10, stock: 5 },
      ]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test Product', price: 10, stock: 5 }),
      create: jest.fn().mockResolvedValue({ id: '2', name: 'New Product', price: 20 }),
      update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated Product' }),
    },
    stockMovement: {
      create: jest.fn().mockResolvedValue({ id: 'mov-1' }),
    },
  };

  const mockAudit = {
    logAction: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated products', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
