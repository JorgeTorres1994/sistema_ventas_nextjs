import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.supplier.create({ data });
    }

    async findAll() {
        return this.prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.supplier.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.supplier.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
