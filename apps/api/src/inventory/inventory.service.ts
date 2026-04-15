import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) {}

    /**
     * GET /inventory
     * Returns paginated product stock list with summary stats
     */
    async getStockOverview(params: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
        stockStatus?: string;
        sortBy?: string;
        sortOrder?: string;
    }) {
        const {
            page = 1,
            limit = 10,
            search,
            categoryId,
            stockStatus,
            sortBy = 'name',
            sortOrder = 'asc',
        } = params;

        const skip = (page - 1) * limit;
        const where: any = { isActive: true };

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (stockStatus === 'out') {
            where.stock = 0;
        } else if (stockStatus === 'low') {
            where.stock = { gt: 0, lt: 10 };
        } else if (stockStatus === 'normal') {
            where.stock = { gte: 10 };
        }

        const orderBy: any = {};
        if (sortBy === 'stock') {
            orderBy.stock = sortOrder;
        } else {
            orderBy.name = sortOrder;
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy,
                include: { category: true },
            }),
            this.prisma.product.count({ where }),
        ]);

        // Summary stats (overall, not filtered)
        const [totalProducts, lowStockCount, outOfStockCount, totalStockValue] = await Promise.all([
            this.prisma.product.count({ where: { isActive: true } }),
            this.prisma.product.count({ where: { isActive: true, stock: { gt: 0, lt: 10 } } }),
            this.prisma.product.count({ where: { isActive: true, stock: 0 } }),
            this.prisma.product.aggregate({
                where: { isActive: true },
                _sum: { stock: true },
            }),
        ]);

        return {
            data: products,
            total,
            page: Number(page),
            limit: Number(limit),
            summary: {
                totalProducts,
                lowStockCount,
                outOfStockCount,
                totalStockUnits: totalStockValue._sum.stock ?? 0,
            },
        };
    }

    /**
     * GET /inventory/movements
     * Returns paginated movement history, with optional filters.
     */
    async getMovements(params: {
        page?: number;
        limit?: number;
        productId?: string;
        type?: string;
        reason?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const {
            page = 1,
            limit = 10,
            productId,
            type,
            reason,
            startDate,
            endDate,
        } = params;

        const skip = (page - 1) * Number(limit);
        const where: any = {};

        if (productId) where.productId = productId;
        if (type) where.type = type;
        if (reason) where.reason = reason;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const [movements, total] = await Promise.all([
            this.prisma.stockMovement.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { product: { include: { category: true } } },
            }),
            this.prisma.stockMovement.count({ where }),
        ]);

        // Summary totals for insights section
        const [totalIn, totalOut] = await Promise.all([
            this.prisma.stockMovement.aggregate({
                where: { type: 'IN' },
                _sum: { quantity: true },
            }),
            this.prisma.stockMovement.aggregate({
                where: { type: 'OUT' },
                _sum: { quantity: true },
            }),
        ]);

        return {
            data: movements,
            total,
            page: Number(page),
            limit: Number(limit),
            insights: {
                totalIn: totalIn._sum.quantity ?? 0,
                totalOut: totalOut._sum.quantity ?? 0,
            },
        };
    }

    /**
     * POST /inventory/adjust
     * Atomically adjusts stock and creates StockMovement record.
     */
    async adjustStock(data: {
        productId: string;
        quantity: number;
        type: 'IN' | 'OUT';
        reason?: string;
        note?: string;
    }) {
        const { productId, quantity, type, reason = 'ADJUSTMENT', note } = data;

        if (quantity <= 0) {
            throw new BadRequestException('Quantity must be greater than zero');
        }

        // Fetch current product in a transaction
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new BadRequestException('Product not found');

            const newStock = type === 'IN'
                ? product.stock + quantity
                : product.stock - quantity;

            if (newStock < 0) {
                throw new BadRequestException(
                    `Cannot remove ${quantity} units. Current stock is only ${product.stock}.`
                );
            }

            // Update stock and create movement atomically
            const [updatedProduct, movement] = await Promise.all([
                tx.product.update({
                    where: { id: productId },
                    data: { stock: newStock },
                }),
                tx.stockMovement.create({
                    data: {
                        productId,
                        type,
                        quantity,
                        reason,
                        referenceId: note,
                    },
                }),
            ]);

            return {
                product: updatedProduct,
                movement,
                newStock,
            };
        });
    }
}
