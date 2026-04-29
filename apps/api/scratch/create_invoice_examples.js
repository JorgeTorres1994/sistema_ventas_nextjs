
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createExamples() {
  // 1. Ejemplo de ERROR (RUC Inválido)
  await prisma.sale.create({
    data: {
      userId: (await prisma.user.findFirst()).id,
      series: 'F001',
      correlative: 999,
      documentType: 'FACTURA',
      total: 1500.00,
      invoiceStatus: 'ERROR',
      sunatResponse: 'Error en el RUC: El número 20000000001 no existe en el padrón de contribuyentes de SUNAT.',
      createdAt: new Date()
    }
  });

  // 2. Ejemplo de PENDIENTE (Sin internet)
  await prisma.sale.create({
    data: {
      userId: (await prisma.user.findFirst()).id,
      series: 'B001',
      correlative: 888,
      documentType: 'BOLETA',
      total: 45.50,
      invoiceStatus: 'PENDING',
      createdAt: new Date(Date.now() - 3600000) // Hace una hora
    }
  });

  console.log('Ejemplos creados con éxito.');
  await prisma.$disconnect();
}

createExamples();
