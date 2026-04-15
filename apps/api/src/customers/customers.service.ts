import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; dni: string; email?: string; phone?: string; address?: string }) {
        const existing = await this.prisma.customer.findUnique({
            where: { dni: data.dni },
        });

        if (existing) {
            throw new ConflictException(`Ya existe un cliente con el DNI/RUC ${data.dni}`);
        }

        return this.prisma.customer.create({ data });
    }

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                sales: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        // Calculate stats
        const stats = customer.sales.reduce((acc, sale) => {
            const saleTotal = Number(sale.total) || 0;
            const saleAmountPaid = Number(sale.amountPaid) || 0;
            acc.totalSpent += saleTotal;
            acc.totalDebt += (saleTotal - saleAmountPaid);
            return acc;
        }, { totalSpent: 0, totalDebt: 0 });

        return {
            ...customer,
            stats
        };
    }

    async update(id: string, data: { name?: string; dni?: string; email?: string; phone?: string; address?: string; isActive?: boolean }) {
        await this.findOne(id);

        if (data.dni) {
            const existing = await this.prisma.customer.findFirst({
                where: { dni: data.dni, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException(`Ya existe otro cliente con el DNI/RUC ${data.dni}`);
            }
        }

        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.customer.delete({ where: { id } });
    }
}
