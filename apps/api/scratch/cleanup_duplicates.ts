import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO LIMPIEZA DE PRODUCTOS DUPLICADOS ---');
  
  const products = await prisma.product.findMany();
  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const p of products) {
    const key = `${p.name.trim().toLowerCase()}-${p.categoryId}`;
    if (seen.has(key)) {
      toDelete.push(p.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Encontrados ${toDelete.length} productos duplicados para eliminar.`);

  // We need to be careful with foreign key constraints (saleItems, etc.)
  // For this local dev audit, we'll try to delete them. 
  // If they have dependencies, we might need to skip or handle them.
  
  for (const id of toDelete) {
    try {
      await prisma.product.delete({ where: { id } });
      console.log(`Eliminado: ${id}`);
    } catch (e) {
      console.warn(`No se pudo eliminar ${id} debido a dependencias activas.`);
    }
  }

  console.log('\n--- CORRIGIENDO CATEGORÍA DE AUDIFONOS PRO MAX ---');
  const electronics = await prisma.category.findUnique({ where: { name: 'Electronics' } });
  if (electronics) {
    await prisma.product.updateMany({
      where: { name: { contains: 'Audifonos Pro Max' } },
      data: { categoryId: electronics.id }
    });
    console.log('Audifonos Pro Max movidos a Electronics.');
  }

  console.log('\n--- LIMPIEZA COMPLETADA ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
