import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CashRegistersService } from '../cash-registers/cash-registers.service.js';

@Injectable()
export class SalesService {
    constructor(
        private prisma: PrismaService,
        private cashService: CashRegistersService
    ) { }

    async createSale(
        userId: string,
        items: { productId: string; quantity: number }[],
        customerId?: string,
        amountPaid?: number,
        paymentMethod?: string,
        status?: 'PAID' | 'PENDING' | 'PARTIAL'
    ) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                let finalCustomerId = customerId;
                
                // Fallback for customerId if omitted, as the POS UI design doesn't have a selector
                if (!finalCustomerId) {
                    let defaultCustomer = await tx.customer.findFirst({
                        where: { name: 'Consumidor Final' }
                    });
                    if (!defaultCustomer) {
                        defaultCustomer = await tx.customer.findFirst();
                    }
                    if (!defaultCustomer) {
                        defaultCustomer = await tx.customer.create({
                            data: { name: 'Consumidor Final', dni: '00000000', email: 'default@ventas.com' }
                        });
                    }
                    finalCustomerId = defaultCustomer.id;
                }

                const user = await tx.user.findUnique({ where: { id: userId } });
                if (!user) {
                    throw new BadRequestException('Usuario no encontrado. Por favor, cierra sesión y vuelve a entrar.');
                }

                // Verify user has an open cash register
                const openRegister = await tx.cashRegister.findFirst({
                    where: { userId, status: 'OPEN' }
                });

                if (!openRegister) {
                    throw new BadRequestException('ACTIVA_CAJA: Debes aperturar o abrir tu caja, antes de realizar cualquier venta.');
                }

                let total = 0;
                const saleItems: { productId: string; quantity: number; price: number }[] = [];

                for (const item of items) {
                    // 1. Get product and check stock
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });

                    if (!product) {
                        throw new BadRequestException(`Producto con ID ${item.productId} no encontrado`);
                    }

                    if (!product.isActive) {
                        throw new BadRequestException(`El producto ${product.name} no está activo`);
                    }

                    if (product.stock < item.quantity) {
                        throw new BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
                    }

                    // 2. Calculate subtotal and track items
                    const productPriceNumber = Number(product.price);
                    total += productPriceNumber * item.quantity;
                    saleItems.push({
                        productId: product.id,
                        quantity: item.quantity,
                        price: productPriceNumber, // Store current price
                    });

                    // 3. Reduce stock
                    await tx.product.update({
                        where: { id: product.id },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }

                const finalStatus = status || (amountPaid !== undefined && amountPaid < total ? 'PARTIAL' : 'PAID');
                const finalAmountPaid = amountPaid !== undefined ? amountPaid : (finalStatus === 'PAID' ? total : 0);

                // Calculate Taxes (exact 8% based on the visual design mockups)
                const taxRate = 8;
                const subtotal = total / (1 + (taxRate / 100));
                const taxAmount = total - subtotal;

                // 4. Create the sale and its items
                const sale = await tx.sale.create({
                    data: {
                        userId,
                        customerId: finalCustomerId,
                        cashRegisterId: openRegister.id,
                        total,
                        subtotal,
                        taxAmount,
                        taxRate,
                        amountPaid: finalAmountPaid,
                        status: finalStatus as any,
                        payments: {
                            create: {
                                amount: finalAmountPaid,
                                method: paymentMethod || 'CASH'
                            }
                        },
                        items: {
                            create: saleItems,
                        },
                    },
                    include: {
                        items: true,
                        customer: true,
                    },
                });

                // 5. If payment is in CASH, log automatic movement
                if ((paymentMethod === 'CASH' || paymentMethod === 'EFECTIVO') && finalAmountPaid > 0) {
                    await tx.cashMovement.create({
                        data: {
                            cashRegisterId: openRegister.id,
                            type: 'IN',
                            amount: finalAmountPaid,
                            description: `Venta POS #${sale.id.slice(0, 8).toUpperCase()}`,
                        }
                    });
                }

                return sale;
            });
        } catch (error) {
            console.error('Error in createSale:', error);
            throw error;
        }
    }

    async findAll(filters: { 
        startDate?: string; 
        endDate?: string; 
        status?: string; 
        customerId?: string;
        search?: string;
    }) {
        const where: any = {};

        if (filters.status && filters.status !== 'All') {
            where.status = filters.status;
        }

        if (filters.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        if (filters.search) {
            where.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }

        return this.prisma.sale.findMany({
            where,
            include: {
                user: { select: { name: true } },
                customer: { select: { name: true, email: true } },
                payments: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } },
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });

        if (!sale) {
            throw new BadRequestException('Venta no encontrada');
        }

        return sale;
    }

    async cancelSale(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { 
                    items: true,
                    payments: true
                },
            });

            if (!sale) {
                throw new BadRequestException('Venta no encontrada');
            }

            if (sale.status === 'CANCELLED') {
                throw new BadRequestException('Esta venta ya ha sido anulada');
            }

            // 1. Update sale status
            await tx.sale.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            // 2. Restore stock and record movement
            for (const item of sale.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });

                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: 'SALE_CANCELLED',
                        referenceId: sale.id,
                    },
                });
            }

            // 3. If it was a CASH sale, register reversal movement
            const cashPayment = sale.payments?.find(p => p.method === 'CASH' || p.method === 'EFECTIVO');
            if (cashPayment && Number(cashPayment.amount) > 0) {
                const openRegister = await tx.cashRegister.findFirst({
                    where: { userId: sale.userId, status: 'OPEN' }
                });
                
                if (openRegister) {
                    await tx.cashMovement.create({
                        data: {
                            cashRegisterId: openRegister.id,
                            type: 'OUT',
                            amount: cashPayment.amount,
                            description: `Anulación Venta #${sale.id.slice(0, 8).toUpperCase()}`,
                        }
                    });
                }
            }

            return { message: 'Venta anulada exitosamente' };
        });
    }
}

