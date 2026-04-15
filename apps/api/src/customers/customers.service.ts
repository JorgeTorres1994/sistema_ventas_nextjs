import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) {}

    async create(data: { name: string; dni: string; email?: string; phone?: string; address?: string }) {
        const existing = await this.prisma.customer.findUnique({ where: { dni: data.dni } });
        if (existing) {
            throw new ConflictException(`A customer with DNI ${data.dni} already exists`);
        }
        return this.prisma.customer.create({ data });
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
                { dni: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { sales: true } }
                },
            }),
            this.prisma.customer.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                sales: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        items: {
                            include: { product: { select: { name: true, imageUrl: true } } },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        const allSales = await this.prisma.sale.findMany({
            where: { customerId: id },
            select: { total: true, createdAt: true },
        });

        const totalSpent = allSales.reduce((sum, s) => sum + Number(s.total), 0);
        const purchaseCount = allSales.length;
        const lastPurchase = allSales.length > 0 ? allSales[0].createdAt : null;

        return {
            ...customer,
            stats: { totalSpent, purchaseCount, lastPurchase },
        };
    }

    async update(
        id: string,
        data: { name?: string; dni?: string; email?: string; phone?: string; address?: string; isActive?: boolean },
    ) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);

        if (data.dni && data.dni !== customer.dni) {
            const existing = await this.prisma.customer.findFirst({
                where: { dni: data.dni, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException(`Another customer already has DNI ${data.dni}`);
            }
        }

        return this.prisma.customer.update({ where: { id }, data });
    }

    async toggleStatus(id: string) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
        return this.prisma.customer.update({
            where: { id },
            data: { isActive: !customer.isActive },
        });
    }
}
