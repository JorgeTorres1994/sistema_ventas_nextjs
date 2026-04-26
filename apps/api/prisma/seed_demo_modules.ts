import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando seeding de datos demo (Final Fix)...');

    // 1. USUARIO ADMIN
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await (prisma as any).user.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            email: 'admin@admin.com',
            password: hashedPassword,
            name: 'Jorge Torres',
        }
    });

    // 2. CAJA ABIERTA
    let register = await (prisma as any).cashRegister.findFirst({ where: { userId: admin.id, status: 'OPEN' } });
    if (!register) {
        register = await (prisma as any).cashRegister.create({
            data: {
                userId: admin.id,
                status: 'OPEN',
                openingBalance: 1000,
            }
        });
    }

    // 3. CATEGORÍA Y PRODUCTO
    let category = await (prisma as any).category.findFirst();
    if (!category) {
        category = await (prisma as any).category.create({ data: { name: 'Electrónica' } });
    }

    let product = await (prisma as any).product.findFirst();
    if (!product) {
        product = await (prisma as any).product.create({
            data: {
                name: 'Smartphone Pro Max',
                description: 'Cámara de 108MP, 256GB',
                price: 3500,
                purchasePrice: 2800,
                stock: 15,
                categoryId: category.id
            }
        });
    }

    // 4. CLIENTE
    let customer = await (prisma as any).customer.findFirst();
    if (!customer) {
        customer = await (prisma as any).customer.create({
            data: {
                name: 'Juan Pérez',
                dni: '77889900',
                email: 'juan@demo.com',
                loyaltyPoints: 250
            }
        });
    } else {
        await (prisma as any).customer.update({
            where: { id: customer.id },
            data: { loyaltyPoints: 250 }
        });
    }

    // 5. GASTOS
    console.log('💸 Creando Gastos...');
    const catAlquiler = await (prisma as any).expenseCategory.upsert({
        where: { name: 'Alquiler' },
        update: {},
        create: { name: 'Alquiler', description: 'Gastos de local' }
    });

    await (prisma as any).expense.create({
        data: {
            description: 'Local Central - Mes Abril',
            amount: 1500,
            date: new Date(),
            categoryId: catAlquiler.id,
            cashRegisterId: register.id,
            paymentMethod: 'CASH'
        }
    });

    // 6. CRÉDITOS
    console.log('💳 Creando Créditos...');
    const saleCredit = await (prisma as any).sale.create({
        data: {
            userId: admin.id,
            customerId: customer.id,
            cashRegisterId: register.id,
            series: 'F001',
            correlative: 50,
            documentType: 'FACTURA',
            total: 2000,
            subtotal: 1694.92,
            taxAmount: 305.08,
            taxRate: 18,
            amountPaid: 500,
            status: 'PARTIAL',
            items: {
                create: { productId: product.id, quantity: 1, price: 2000 }
            }
        }
    });

    await (prisma as any).creditSale.create({
        data: {
            saleId: saleCredit.id,
            totalAmount: 2000,
            remainingAmount: 1500,
            status: 'PENDING',
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        }
    });

    // 7. KARDEX
    console.log('📦 Creando Kardex...');
    await (prisma as any).stockMovement.create({
        data: {
            productId: product.id,
            type: 'IN',
            quantity: 10,
            unitCost: 2800,
            totalCost: 28000,
            prevStock: 5,
            nextStock: 15,
            prevValue: 14000,
            nextValue: 42000,
            reason: 'PURCHASE'
        }
    });

    // 8. PROMOCIONES
    console.log('🎁 Creando Promociones...');
    await (prisma as any).promotion.upsert({
        where: { id: 'promo-demo-1' },
        update: { isActive: true },
        create: {
            id: 'promo-demo-1',
            name: 'Cyber Sale',
            description: '20% off en productos seleccionados',
            type: 'PERCENTAGE',
            value: 20,
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            isActive: true
        }
    });

    await (prisma as any).coupon.upsert({
        where: { code: 'PROMO2026' },
        update: { isActive: true },
        create: {
            code: 'PROMO2026',
            description: 'Cupón especial de temporada',
            type: 'PERCENTAGE',
            value: 10,
            minPurchase: 200,
            startDate: new Date(),
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            isActive: true
        }
    });

    console.log('✅ Seeding completado con éxito.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
