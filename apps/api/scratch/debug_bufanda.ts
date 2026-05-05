import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'Bufanda de Cachemira', mode: 'insensitive' } },
    include: { category: true }
  });
  
  console.log(`Encontrados ${products.length} productos con ese nombre:`);
  products.forEach(p => {
    console.log(`- [${p.id}] ${p.name} | Cat: ${p.category?.name} | Active: ${p.isActive}`);
  });
}

main();
