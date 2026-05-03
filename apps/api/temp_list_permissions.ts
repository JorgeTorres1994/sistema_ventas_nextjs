import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { module: 'asc' },
      { action: 'asc' }
    ]
  });
  console.log(JSON.stringify(permissions, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
