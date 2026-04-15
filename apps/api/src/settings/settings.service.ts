import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.ensureSettings();
        await this.seedPaymentMethods();
    }

    private async ensureSettings() {
        const count = await this.prisma.setting.count();
        if (count === 0) {
            await this.prisma.setting.create({
                data: {
                    businessName: 'Nexus Genesis',
                    address: 'Lima, Perú',
                    phone: '+51 900 000 000',
                    email: 'contacto@nexusgenesis.com',
                    taxRate: 18,
                    currency: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                }
            });
        }
    }

    private async seedPaymentMethods() {
        const defaults = ['Efectivo', 'Tarjeta', 'Billetera Digital'];
        for (const name of defaults) {
            await this.prisma.paymentMethod.upsert({
                where: { name },
                update: {},
                create: { name, isActive: true }
            });
        }
    }

    async getSettings() {
        return this.prisma.setting.findFirst();
    }

    async updateSettings(data: any) {
        const current = await this.getSettings();
        if (!current) throw new Error('Settings not initialized');
        return this.prisma.setting.update({
            where: { id: current.id },
            data: {
                ...data,
                taxRate: data.taxRate !== undefined ? Number(data.taxRate) : undefined,
            }
        });
    }

    async getPaymentMethods() {
        return this.prisma.paymentMethod.findMany({
            orderBy: { createdAt: 'asc' }
        });
    }

    async togglePaymentMethod(id: string) {
        const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
        if (!method) throw new Error('Método de pago no encontrado');
        return this.prisma.paymentMethod.update({
            where: { id },
            data: { isActive: !method.isActive }
        });
    }

    async upsertPaymentMethod(data: { id?: string; name: string; isActive?: boolean }) {
        if (data.id) {
            return this.prisma.paymentMethod.update({
                where: { id: data.id },
                data: { name: data.name, isActive: data.isActive }
            });
        }
        return this.prisma.paymentMethod.create({
            data: { name: data.name, isActive: data.isActive ?? true }
        });
    }
}
