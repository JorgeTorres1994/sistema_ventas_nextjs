import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { supplierId, items, total } = data;

        // Use a transaction to ensure both purchase and stock updates succeed
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Purchase
            const purchase = await tx.purchase.create({
                data: {
                    supplierId,
                    total,
                    status: 'COMPLETED',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                        })),
                    },
                },
                include: { items: true },
            });

            // 2. Update Product stock and purchasePrice for each item
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                        purchasePrice: item.costPrice,
                    },
                });
            }

            return purchase;
        });
    }

    async findAll() {
        return this.prisma.purchase.findMany({
            include: {
                supplier: true,
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.purchase.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: { product: true },
                },
            },
        });
    }
}
