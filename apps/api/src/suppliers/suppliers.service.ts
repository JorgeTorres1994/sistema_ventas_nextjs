import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) {}

    async create(data: { name: string; dniRuc: string; email?: string; phone?: string; address?: string }) {
        const existing = await this.prisma.supplier.findUnique({ where: { dniRuc: data.dniRuc } });
        if (existing) {
            throw new ConflictException(`A supplier with DNI/RUC ${data.dniRuc} already exists`);
        }
        return this.prisma.supplier.create({ data });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) {
        const { page = 1, limit = 10, search, isActive } = params;
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { dniRuc: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { purchases: true } }
                },
            }),
            this.prisma.supplier.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                purchases: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }

        const allPurchases = await this.prisma.purchase.findMany({
            where: { supplierId: id },
            select: { total: true, createdAt: true },
        });

        const totalSpent = allPurchases.reduce((sum, p) => sum + Number(p.total), 0);
        const purchaseCount = allPurchases.length;
        const lastPurchase = allPurchases.length > 0 ? allPurchases[0].createdAt : null;

        return {
            ...supplier,
            stats: { totalSpent, purchaseCount, lastPurchase },
        };
    }

    async update(
        id: string,
        data: { name?: string; dniRuc?: string; email?: string; phone?: string; address?: string; isActive?: boolean },
    ) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException(`Supplier with ID ${id} not found`);

        if (data.dniRuc && data.dniRuc !== supplier.dniRuc) {
            const existing = await this.prisma.supplier.findFirst({
                where: { dniRuc: data.dniRuc, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException(`Another supplier already has DNI/RUC ${data.dniRuc}`);
            }
        }

        return this.prisma.supplier.update({ where: { id }, data });
    }

    async toggleStatus(id: string) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException(`Supplier with ID ${id} not found`);
        return this.prisma.supplier.update({
            where: { id },
            data: { isActive: !supplier.isActive },
        });
    }
}
