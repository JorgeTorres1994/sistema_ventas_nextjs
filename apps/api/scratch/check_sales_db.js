
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSales() {
  const sales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      series: true,
      correlative: true,
      documentType: true,
      invoiceStatus: true
    }
  });
  console.log('Recent Sales Invoicing Data:');
  console.table(sales);
  await prisma.$disconnect();
}

checkSales();
