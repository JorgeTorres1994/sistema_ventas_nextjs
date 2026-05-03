import { PrismaClient } from '@prisma/client';

async function restoreSales() {
  const remote = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres:Sukitteiinayo1@db.tpwicvbekroujrossswp.supabase.co:5432/postgres' } }
  });
  const local = new PrismaClient();

  console.log('--- Iniciando Rescate de Ventas desde Supabase ---');

  try {
    const sales = await remote.sale.findMany({
        include: { items: true }
    });
    console.log(`Rescatando ${sales.length} ventas y sus detalles...`);

    for (const sale of sales) {
      // Upsert de la venta
      await local.sale.upsert({
        where: { id: sale.id },
        update: {
          series: sale.series,
          correlative: sale.correlative,
          total: sale.total,
          subtotal: sale.subtotal,
          taxAmount: sale.taxAmount,
          status: sale.status,
          userId: sale.userId,
          customerId: sale.customerId,
          createdAt: sale.createdAt,
          invoiceStatus: sale.invoiceStatus,
          externalId: sale.externalId
        },
        create: {
          id: sale.id,
          series: sale.series,
          correlative: sale.correlative,
          total: sale.total,
          subtotal: sale.subtotal,
          taxAmount: sale.taxAmount,
          status: sale.status,
          userId: sale.userId,
          customerId: sale.customerId,
          createdAt: sale.createdAt,
          invoiceStatus: sale.invoiceStatus,
          externalId: sale.externalId
        }
      });

      // Insertar items de la venta
      for (const item of sale.items) {
        await local.saleItem.upsert({
          where: { id: item.id },
          update: { quantity: item.quantity, price: item.price, productId: item.productId, saleId: item.saleId },
          create: { id: item.id, quantity: item.quantity, price: item.price, productId: item.productId, saleId: item.saleId }
        });
      }
    }

    console.log('--- Historial de Ventas Restaurado ---');
  } catch (error) {
    console.error('Error durante el rescate de ventas:', error);
  } finally {
    await remote.$disconnect();
    await local.$disconnect();
  }
}

restoreSales();
