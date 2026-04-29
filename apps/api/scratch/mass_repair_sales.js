
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repairAllSales() {
  const sales = await prisma.sale.findMany({
    where: {
      OR: [
        { series: null },
        { correlative: null },
        { documentType: null }
      ]
    }
  });

  console.log(`Found ${sales.length} sales to repair.`);

  for (const sale of sales) {
    const docType = sale.documentType || 'BOLETA';
    const series = docType === 'FACTURA' ? 'F001' : 'B001';
    // Generate a unique-ish number if not present
    const correlative = sale.correlative || Math.floor(Math.random() * 1000000);
    
    await prisma.sale.update({
      where: { id: sale.id },
      data: {
        series: sale.series || series,
        correlative: correlative,
        documentType: docType
      }
    });
    console.log(`Repaired sale ${sale.id} -> ${series}-${correlative}`);
  }

  await prisma.$disconnect();
}

repairAllSales();
