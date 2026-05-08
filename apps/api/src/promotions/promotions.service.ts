import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  // --- Promotions Logic ---
  async createPromotion(data: any) {
    const { productIds, name, description, type, value, startDate, endDate, isActive, minPurchase } = data;
    
    return (this.prisma as any).promotion.create({
      data: {
        name,
        description,
        type,
        value: value ? Number(value) : 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        products: {
          create: productIds?.map((id: string) => ({ productId: id })) || []
        }
      },
      include: { products: true }
    });
  }

  async getAllPromotions() {
    return (this.prisma as any).promotion.findMany({
      orderBy: { createdAt: 'desc' },
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

  async updatePromotion(id: string, data: any) {
    const { productIds, name, description, type, value, startDate, endDate, isActive, minPurchase } = data;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = Number(value);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (minPurchase !== undefined) updateData.minPurchase = Number(minPurchase);

    if (productIds) {
      await (this.prisma as any).productPromotion.deleteMany({ where: { promotionId: id } });
      updateData.products = {
        create: productIds.map((pid: string) => ({ productId: pid }))
      };
    }

    return (this.prisma as any).promotion.update({
      where: { id },
      data: updateData,
      include: { products: true }
    });
  }

  async togglePromotionStatus(id: string) {
    const promo = await (this.prisma as any).promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promoción no encontrada');
    return (this.prisma as any).promotion.update({
      where: { id },
      data: { isActive: !promo.isActive }
    });
  }

  // --- Coupons Logic ---
  async createCoupon(data: any) {
    const { code, description, type, value, minPurchase, startDate, endDate, usageLimit, isActive } = data;
    
    return (this.prisma as any).coupon.create({
      data: {
        code,
        description,
        type,
        value: value ? Number(value) : 0,
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
  }

  async getCoupons() {
    return (this.prisma as any).coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateCoupon(id: string, data: any) {
    const { code, description, type, value, minPurchase, startDate, endDate, usageLimit, isActive } = data;
    
    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = Number(value);
    if (minPurchase !== undefined) updateData.minPurchase = Number(minPurchase);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    return (this.prisma as any).coupon.update({
      where: { id },
      data: updateData
    });
  }

  async toggleCouponStatus(id: string) {
    const coupon = await (this.prisma as any).coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    return (this.prisma as any).coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive }
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
