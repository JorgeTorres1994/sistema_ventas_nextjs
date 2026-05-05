import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  
  console.log('--- PRODUCTOS EN DB ---');
  products.forEach(p => {
    console.log(`[${p.id}] ${p.name} - ${p.category?.name || 'No Cat'}`);
  });
  
  const categories = await prisma.category.findMany();
  console.log('\n--- CATEGORIAS EN DB ---');
  categories.forEach(c => {
    console.log(`[${c.id}] ${c.name}`);
  });
}

main();
