import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CashRegistersService {
    constructor(private prisma: PrismaService) {}

    async openRegister(userId: string, openingBalance: number, notes?: string) {
        // Check if there's already an open register for this user
        const existingOpen = await this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' }
        });

        if (existingOpen) {
            throw new BadRequestException('El usuario ya tiene un turno de caja abierto.');
        }

        return this.prisma.cashRegister.create({
            data: {
                userId,
                openingBalance,
                notes
            }
        });
    }

    async getCurrentRegister(userId: string) {
        return this.prisma.cashRegister.findFirst({
            where: { userId, status: 'OPEN' },
            include: {
                sales: {
                    include: { items: true, customer: true }
                }
            }
        });
    }

    async getRegisterSummary(id: string) {
        const register = await this.prisma.cashRegister.findUnique({
            where: { id },
            include: {
                sales: {
                    include: { payments: true }
                }
            }
        });

        if (!register) throw new NotFoundException('Caja no encontrada.');

        // Calculate expected balance: openingBalance + all cash sales payments amount
        let cashSalesSum = 0;
        let cardSalesSum = 0;

        for (const sale of register.sales) {
            for (const payment of sale.payments) {
                const amount = Number(payment.amount);
                if (payment.method === 'EFECTIVO' || payment.method === 'CASH') {
                    cashSalesSum += amount;
                } else {
                    cardSalesSum += amount;
                }
            }
        }

        const expectedBalance = Number(register.openingBalance) + cashSalesSum;

        return {
            ...register,
            calculatedExpectedBalance: expectedBalance,
            cashSalesSum,
            cardSalesSum,
            totalSalesCount: register.sales.length
        };
    }

    async closeRegister(id: string, closingBalance: number, notes?: string) {
        const summary = await this.getRegisterSummary(id);
        
        if (summary.status === 'CLOSED') {
            throw new BadRequestException('Esta caja ya está cerrada.');
        }

        // Append closing notes if any
        const newNotes = summary.notes 
            ? `${summary.notes}\n[CIERRE]: ${notes || ''}` 
            : `[CIERRE]: ${notes || ''}`;

        return this.prisma.cashRegister.update({
            where: { id },
            data: {
                status: 'CLOSED',
                closingDate: new Date(),
                closingBalance,
                expectedBalance: summary.calculatedExpectedBalance,
                notes: newNotes.trim()
            }
        });
    }
}
