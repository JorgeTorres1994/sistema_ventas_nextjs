import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class DocumentSeriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.documentSeries.findMany({
            orderBy: { documentType: 'asc' }
        });
    }

    async findOne(id: string) {
        const series = await this.prisma.documentSeries.findUnique({ where: { id } });
        if (!series) throw new BadRequestException('Serie no encontrada');
        return series;
    }

    async findByType(type: string) {
        return this.prisma.documentSeries.findFirst({
            where: { documentType: type, isActive: true }
        });
    }

    async create(data: { documentType: string; prefix: string; startNumber: number; description?: string }) {
        return this.prisma.documentSeries.create({
            data: {
                ...data,
                currentNumber: data.startNumber - 1
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.documentSeries.update({
            where: { id },
            data
        });
    }

    async getNextNumber(type: string) {
        return await this.prisma.$transaction(async (tx) => {
            const series = await tx.documentSeries.findFirst({
                where: { documentType: type, isActive: true }
            });

            if (!series) {
                throw new BadRequestException(`No hay una serie activa configurada para ${type}`);
            }

            const nextNumber = series.currentNumber + 1;

            await tx.documentSeries.update({
                where: { id: series.id },
                data: { currentNumber: nextNumber }
            });

            return {
                series: series.prefix,
                correlative: nextNumber,
                formatted: `${series.prefix}-${nextNumber.toString().padStart(8, '0')}`
            };
        });
    }
}
