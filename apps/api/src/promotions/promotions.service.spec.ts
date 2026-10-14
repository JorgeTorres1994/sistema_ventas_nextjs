import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsService } from './promotions.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PromotionsService - Coupon Rules & Loyalty Points', () => {
  let service: PromotionsService;

  const mockPrisma: any = {
    coupon: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    promotion: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if coupon is expired', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValueOnce({
      id: 'c-1',
      code: 'EXPIRED10',
      isActive: true,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-01-01'),
      usageLimit: null,
      usageCount: 0,
      minPurchase: 0,
    });

    await expect(service.validateCoupon('EXPIRED10', 100)).rejects.toThrow(
      'El cupón ha expirado o aún no está vigente'
    );
  });

  it('should throw BadRequestException if purchase does not meet minPurchase', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValueOnce({
      id: 'c-2',
      code: 'MIN100',
      isActive: true,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2030-01-01'),
      usageLimit: null,
      usageCount: 0,
      minPurchase: 100,
    });

    await expect(service.validateCoupon('MIN100', 50)).rejects.toThrow(
      'El monto mínimo para este cupón es S/ 100'
    );
  });

  it('should calculate 1 loyalty point per 10 currency units spent', () => {
    expect(service.calculatePoints(100)).toBe(10);
    expect(service.calculatePoints(99)).toBe(9);
    expect(service.calculatePoints(5)).toBe(0);
  });
});
