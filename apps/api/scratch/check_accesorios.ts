import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categoryId = '91490950-71e7-495d-b2f3-b71938fbbcb9'; // Accesorios
  
  const products = await prisma.product.findMany({
    where: { categoryId },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`Encontrados ${products.length} productos en Accesorios:`);
  products.forEach(p => {
    console.log(`- [${p.id}] ${p.name}`);
  });
}

main();
