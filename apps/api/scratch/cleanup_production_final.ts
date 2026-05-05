import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO LIMPIEZA DE PRODUCTOS DUPLICADOS (PRODUCCIÓN) ---');
  
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' } // Keep the oldest one
  });
  
  const seen = new Set<string>();
  const duplicates: any[] = [];

  for (const p of products) {
    const key = `${p.name.trim().toLowerCase()}-${p.categoryId}`;
    if (seen.has(key)) {
      duplicates.push(p);
    } else {
      seen.add(key);
    }
  }

  console.log(`Encontrados ${duplicates.length} productos redundantes.`);

  for (const p of duplicates) {
    try {
      // Try to delete
      await prisma.product.delete({ where: { id: p.id } });
      console.log(`Eliminado: ${p.name} (${p.id})`);
    } catch (e) {
      // If has dependencies, just deactivate
      await prisma.product.update({
        where: { id: p.id },
        data: { isActive: false }
      });
      console.log(`Desactivado (por dependencias): ${p.name} (${p.id})`);
    }
  }

  console.log('\n--- LIMPIEZA COMPLETADA ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
