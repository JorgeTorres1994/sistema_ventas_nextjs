import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CashRegistersService {
    constructor(private prisma: PrismaService) { }

    async openRegister(userId: string, openingBalance: number, notes?: string) {
        const active = await this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' }
        });

        if (active) {
            throw new BadRequestException('Ya existe una caja abierta para este usuario.');
        }

        return this.prisma.cashRegister.create({
            data: {
                userId,
                openingBalance,
                notes,
                status: 'OPEN',
            }
        });
    }

    async getCurrentRegister(userId: string) {
        const register = await this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' },
            include: {
                cashMovements: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!register) return null;

        // Calculate current balances from movements
        const movements = await this.prisma.cashMovement.findMany({
            where: { cashRegisterId: register.id }
        });

        const totalIn = movements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + Number(m.amount), 0);
        const totalOut = movements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + Number(m.amount), 0);

        const currentBalance = Number(register.openingBalance) + totalIn - totalOut;

        return {
            ...register,
            currentBalance,
            totalIn,
            totalOut
        };
    }

    async addMovement(userId: string, data: { type: 'IN' | 'OUT'; amount: number; description: string }) {
        const register = await this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' }
        });

        if (!register) {
            throw new BadRequestException('Debes abrir la caja antes de registrar movimientos.');
        }

        return this.prisma.cashMovement.create({
            data: {
                cashRegisterId: register.id,
                type: data.type,
                amount: data.amount,
                description: data.description,
            }
        });
    }

    async getMovements(userId: string) {
        const register = await this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' }
        });

        if (!register) return [];

        return this.prisma.cashMovement.findMany({
            where: { cashRegisterId: register.id },
            orderBy: { createdAt: 'desc' }
        });
    }

    async closeRegister(userId: string, closingBalance: number, notes?: string) {
        const status = await this.getCurrentRegister(userId);
        
        if (!status) {
            throw new BadRequestException('No hay ninguna caja abierta para cerrar.');
        }

        const closed = await this.prisma.cashRegister.update({
            where: { id: status.id },
            data: {
                status: 'CLOSED',
                closingDate: new Date(),
                closingBalance,
                expectedBalance: status.currentBalance,
                notes: notes ? `${status.notes || ''} | [CIERRE]: ${notes}` : status.notes
            }
        });

        // BUG-09 FIX: informar los créditos pendientes de cobro vinculados a esta caja
        const pendingCredits = await this.prisma.creditSale.findMany({
            where: {
                sale: { cashRegisterId: status.id },
                status: { not: 'PAID' }
            },
            include: {
                sale: { include: { customer: { select: { name: true } } } }
            }
        });

        const totalPendingReceivable = pendingCredits.reduce(
            (sum, c) => sum + Number(c.remainingAmount), 0
        );

        return {
            register: closed,
            summary: {
                expectedBalance: status.currentBalance,
                closingBalance,
                difference: closingBalance - status.currentBalance,
                pendingCreditsCount: pendingCredits.length,
                totalPendingReceivable,
                pendingCredits: pendingCredits.map(c => ({
                    id: c.id,
                    customer: (c.sale as any)?.customer?.name || 'Sin cliente',
                    remaining: Number(c.remainingAmount)
                }))
            }
        };
    }
}
