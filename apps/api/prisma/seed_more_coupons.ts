import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Agregando más cupones y datos demo...');

    // 1. CLIENTE CON PUNTOS
    await (prisma as any).customer.updateMany({
        data: { loyaltyPoints: 500 }
    });

    // 2. MÁS CUPONES
    console.log('🎫 Creando variedad de cupones...');
    const coupons = [
        {
            code: 'DESCUENTO50',
            description: 'S/ 50 de descuento fijo por compras mayores a S/ 500.',
            type: 'FIXED_AMOUNT',
            value: 50,
            minPurchase: 500,
            startDate: new Date(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            isActive: true
        },
        {
            code: 'FLASH25',
            description: '25% de descuento relámpago. ¡Solo por hoy!',
            type: 'PERCENTAGE',
            value: 25,
            minPurchase: 50,
            startDate: new Date(),
            endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            isActive: true
        },
        {
            code: 'VIPGOLD',
            description: 'Cupón exclusivo para clientes VIP. 10% adicional.',
            type: 'PERCENTAGE',
            value: 10,
            minPurchase: 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: true
        },
        {
            code: 'PRIMERACOMPRA',
            description: 'S/ 15 de regalo en tu primera compra.',
            type: 'FIXED_AMOUNT',
            value: 15,
            minPurchase: 50,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true
        }
    ];

    for (const c of coupons) {
        await (prisma as any).coupon.upsert({
            where: { code: c.code },
            update: { isActive: true, value: c.value, type: c.type },
            create: c
        });
    }

    // 3. MÁS PROMOCIONES
    console.log('📢 Creando promociones adicionales...');
    await (prisma as any).promotion.upsert({
        where: { id: 'promo-demo-2' },
        update: { isActive: true },
        create: {
            id: 'promo-demo-2',
            name: 'Liquidación de Temporada',
            description: 'Hasta 40% de descuento en ropa de invierno.',
            type: 'PERCENTAGE',
            value: 40,
            startDate: new Date(),
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            isActive: true,
            minPurchase: 0
        }
    });

    console.log('✅ Cupones y promociones adicionales listos.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
