import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  // --- Accounts Receivable (Clientes) ---
  async getReceivables(params: {
    status?: string;
    customerId?: string;
    search?: string;
  }) {
    const { status, customerId, search } = params;
    return this.prisma.creditSale.findMany({
      where: {
        status: status || undefined,
        sale: {
          customerId: customerId || undefined,
          customer: search ? {
            name: { contains: search, mode: 'insensitive' }
          } : undefined
        }
      },
      include: {
        sale: {
          include: {
            customer: true,
            user: { select: { name: true } }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getReceivableById(id: string) {
    const credit = await this.prisma.creditSale.findUnique({
      where: { id },
      include: {
        sale: { include: { customer: true } },
        payments: { orderBy: { date: 'desc' } }
      }
    });
    if (!credit) throw new NotFoundException('Crédito de venta no encontrado');
    return credit;
  }

  // --- Accounts Payable (Proveedores) ---
  async getPayables(params: {
    status?: string;
    supplierId?: string;
    search?: string;
  }) {
    const { status, supplierId, search } = params;
    return this.prisma.creditPurchase.findMany({
      where: {
        status: status || undefined,
        purchase: {
          supplierId: supplierId || undefined,
          supplier: search ? {
            name: { contains: search, mode: 'insensitive' }
          } : undefined
        }
      },
      include: {
        purchase: {
          include: {
            supplier: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPayableById(id: string) {
    const credit = await this.prisma.creditPurchase.findUnique({
      where: { id },
      include: {
        purchase: { include: { supplier: true } },
        payments: { orderBy: { date: 'desc' } }
      }
    });
    if (!credit) throw new NotFoundException('Crédito de compra no encontrado');
    return credit;
  }

  // --- Recording Payments (Abonos) ---
  async recordPayment(data: {
    amount: number;
    paymentMethod: string;
    notes?: string;
    creditSaleId?: string;
    creditPurchaseId?: string;
    cashRegisterId?: string;
  }) {
    const { amount, creditSaleId, creditPurchaseId, cashRegisterId } = data;

    if (!creditSaleId && !creditPurchaseId) {
      throw new BadRequestException('Debe especificar un crédito de venta o de compra');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate Credit and update its balance
      let updatedCredit;
      if (creditSaleId) {
        const credit = await tx.creditSale.findUnique({ where: { id: creditSaleId } });
        if (!credit) throw new NotFoundException('Crédito de venta no encontrado');
        // BUG-08 FIX: verificar que el crédito no esté ya completamente pagado
        if (credit.status === 'PAID') throw new BadRequestException('Este crédito ya fue cancelado en su totalidad.');
        
        const newRemaining = Number(credit.remainingAmount) - amount;
        if (newRemaining < -0.01) throw new BadRequestException('El monto del abono supera la deuda');

        updatedCredit = await tx.creditSale.update({
          where: { id: creditSaleId },
          data: {
            remainingAmount: Math.max(0, newRemaining),
            status: newRemaining <= 0 ? 'PAID' : 'PARTIAL'
          }
        });
      } else {
        const credit = await tx.creditPurchase.findUnique({ where: { id: creditPurchaseId } });
        if (!credit) throw new NotFoundException('Crédito de compra no encontrado');
        // BUG-08 FIX: verificar que el crédito no esté ya completamente pagado
        if (credit.status === 'PAID') throw new BadRequestException('Esta deuda ya fue cancelada en su totalidad.');

        const newRemaining = Number(credit.remainingAmount) - amount;
        if (newRemaining < -0.01) throw new BadRequestException('El monto del abono supera la deuda');

        updatedCredit = await tx.creditPurchase.update({
          where: { id: creditPurchaseId },
          data: {
            remainingAmount: Math.max(0, newRemaining),
            status: newRemaining <= 0 ? 'PAID' : 'PARTIAL'
          }
        });
      }

      // 2. Create the Payment record
      const payment = await tx.creditPayment.create({
        data: {
          amount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          creditSaleId,
          creditPurchaseId,
          cashRegisterId
        }
      });

      // 3. If paid by cash, record a movement in the register
      if (cashRegisterId && data.paymentMethod === 'CASH') {
        const register = await tx.cashRegister.findUnique({ where: { id: cashRegisterId } });
        if (!register || register.status !== 'OPEN') {
          throw new BadRequestException('La caja debe estar abierta para registrar el pago');
        }

        // For CreditSale (Receivable) -> Money IN
        // For CreditPurchase (Payable) -> Money OUT
        const movementType = creditSaleId ? 'IN' : 'OUT';
        const description = creditSaleId 
          ? `Abono de Cliente - Ref: ${creditSaleId.slice(0,8)}` 
          : `Pago a Proveedor - Ref: ${creditPurchaseId?.slice(0,8)}`;

        await tx.cashMovement.create({
          data: {
            cashRegisterId,
            type: movementType,
            amount,
            description
          }
        });
      }

      return { payment, updatedCredit };
    });
  }
}
