import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        supplierId: string;
        items: { productId: string; quantity: number; costPrice: number }[];
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        notes?: string;
        expectedDelivery?: string;
        shippingCost?: number;
        taxAmount?: number;
        subtotal?: number;
        total: number;
    }) {
        const { 
            supplierId, items, status = 'COMPLETED', 
            notes, expectedDelivery, shippingCost = 0, 
            taxAmount = 0, subtotal = 0, total 
        } = data;

        if (!items || items.length === 0) {
            throw new BadRequestException('At least one product is required to register a purchase');
        }

        // Use a transaction to ensure atomic updates across multiple tables
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Purchase record
            const purchase = await tx.purchase.create({
                data: {
                    supplierId,
                    total,
                    subtotal,
                    taxAmount,
                    shippingCost,
                    status,
                    notes,
                    expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                        })),
                    },
                },
                include: {
                    items: { include: { product: true } },
                    supplier: true,
                },
            });

            // If COMPLETED, we process stock and movements
            if (status === 'COMPLETED') {
                for (const item of items) {
                    // 2. Update Product stock and last purchase price
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { increment: item.quantity },
                            purchasePrice: item.costPrice,
                        },
                    });

                    // 3. Register Stock Movement
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            type: 'IN',
                            quantity: item.quantity,
                            reason: 'PURCHASE',
                            referenceId: purchase.id,
                        },
                    });
                }
            }

            return purchase;
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        status?: string;
        supplierId?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const { page = 1, limit = 10, status, supplierId, search, startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) where.status = status;
        if (supplierId) where.supplierId = supplierId;
        
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { supplier: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                skip,
                take: limit,
                include: {
                    supplier: { select: { name: true, dniRuc: true } },
                    _count: { select: { items: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.purchase.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: { 
                            include: { category: true }
                        }
                    },
                },
            },
        });

        if (!purchase) {
            throw new NotFoundException(`Purchase with ID ${id} not found`);
        }

        return purchase;
    }
}
