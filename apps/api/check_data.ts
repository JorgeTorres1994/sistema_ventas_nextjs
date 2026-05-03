import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('--- Auditoría de Datos en Tiempo Real ---');
  
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const saleCount = await prisma.sale.count();
  const roleCount = await prisma.role.count();

  console.log(`Usuarios: ${userCount}`);
  console.log(`Productos: ${productCount}`);
  console.log(`Categorías: ${categoryCount}`);
  console.log(`Ventas: ${saleCount}`);
  console.log(`Roles: ${roleCount}`);

  if (productCount > 0) {
    const sampleProduct = await prisma.product.findFirst();
    console.log(`Producto de Ejemplo: ${sampleProduct?.name}`);
  }

  await prisma.$disconnect();
}

check();
