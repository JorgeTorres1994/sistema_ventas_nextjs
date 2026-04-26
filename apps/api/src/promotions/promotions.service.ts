import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  // --- Promotions Logic ---
  async createPromotion(data: any) {
    const { productIds, ...promoData } = data;
    return (this.prisma as any).promotion.create({
      data: {
        ...promoData,
        products: {
          create: productIds?.map((id: string) => ({ productId: id }))
        }
      },
      include: { products: true }
    });
  }

  async getActivePromotions() {
    const now = new Date();
    return (this.prisma as any).promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: { products: true }
    });
  }

  // --- Coupons Logic ---
  async createCoupon(data: any) {
    return (this.prisma as any).coupon.create({ data });
  }

  async getCoupons() {
    return (this.prisma as any).coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async validateCoupon(code: string, purchaseAmount: number) {
    const now = new Date();
    const coupon = await (this.prisma as any).coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Cupón no válido o inactivo');
    }

    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('El cupón ha expirado o aún no está vigente');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('El cupón ha alcanzado su límite de uso');
    }

    if (purchaseAmount < Number(coupon.minPurchase)) {
      throw new BadRequestException(`El monto mínimo para este cupón es S/ ${coupon.minPurchase}`);
    }

    return coupon;
  }

  // --- Loyalty Logic ---
  async getCustomerPoints(customerId: string) {
    const customer = await (this.prisma as any).customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return (customer as any).loyaltyPoints;
  }

  /**
   * Logic to calculate points earned from a sale
   * Default: 1 point per 10 currency units spent
   */
  calculatePoints(amount: number): number {
    return Math.floor(amount / 10);
  }

  /**
   * Logic to calculate discount from points
   * Default: 100 points = 10 currency units
   */
  calculatePointDiscount(points: number): number {
    return points * 0.1;
  }

  async applyPointsRedemption(customerId: string, pointsToRedeem: number, tx: any) {
    const customer = await (tx as any).customer.findUnique({ where: { id: customerId } });
    if ((customer as any).loyaltyPoints < pointsToRedeem) {
      throw new BadRequestException('Puntos insuficientes');
    }

    await tx.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { decrement: pointsToRedeem } }
    });
  }
}
