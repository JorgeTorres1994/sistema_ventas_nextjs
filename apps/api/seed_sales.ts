import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function seedSales() {
  console.log('Inyectando ventas de prueba para el Dashboard...');
  
  const user = await prisma.user.findFirst();
  const products = await prisma.product.findMany({ take: 3 });

  if (!user || products.length === 0) {
    console.log('Error: No hay usuarios o productos para crear ventas.');
    return;
  }

  // Crear 5 ventas en los últimos 7 días
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const subtotal = products.reduce((acc, p) => acc + Number(p.price), 0);
    const total = subtotal * 1.18;

    await prisma.sale.create({
      data: {
        total: new Decimal(total),
        subtotal: new Decimal(subtotal),
        taxAmount: new Decimal(total - subtotal),
        userId: user.id,
        status: 'PAID',
        createdAt: date,
        items: {
          create: products.map(p => ({
            productId: p.id,
            quantity: 1,
            price: p.price
          }))
        }
      }
    });
  }

  console.log('¡Ventas inyectadas con éxito!');
  await prisma.$disconnect();
}

seedSales();
