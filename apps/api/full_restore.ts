import { PrismaClient } from '@prisma/client';

async function fullRestore() {
  const remote = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres:Sukitteiinayo1@db.tpwicvbekroujrossswp.supabase.co:5432/postgres' } }
  });
  const local = new PrismaClient();

  console.log('--- INICIANDO RESTAURACIÓN TOTAL DE ÉLITE ---');

  try {
    // 1. Seguridad (Roles y Permisos)
    console.log('Restaurando Seguridad...');
    const permissions = await remote.permission.findMany({ select: { id: true, name: true, module: true, action: true, description: true } });
    for (const p of permissions) {
      await local.permission.upsert({ where: { id: p.id }, update: p, create: p });
    }

    const rolePermissions = await remote.rolePermission.findMany();
    for (const rp of rolePermissions) {
      await local.rolePermission.upsert({ 
        where: { roleId_permissionId: { roleId: rp.roleId, permissionId: rp.permissionId } },
        update: {},
        create: rp
      });
    }

    // 2. Cotizaciones
    console.log('Restaurando Cotizaciones...');
    const quotations = await remote.quotation.findMany({ include: { items: true } });
    for (const q of quotations) {
      await local.quotation.upsert({
        where: { id: q.id },
        update: { number: q.number, subtotal: q.subtotal, taxAmount: q.taxAmount, total: q.total, status: q.status, expirationDate: q.expirationDate, userId: q.userId, customerId: q.customerId },
        create: { id: q.id, number: q.number, subtotal: q.subtotal, taxAmount: q.taxAmount, total: q.total, status: q.status, expirationDate: q.expirationDate, userId: q.userId, customerId: q.customerId }
      });
      for (const item of q.items) {
        await local.quotationItem.upsert({
          where: { id: item.id },
          update: { quantity: item.quantity, price: item.price, productId: item.productId, quotationId: item.quotationId },
          create: { id: item.id, quantity: item.quantity, price: item.price, productId: item.productId, quotationId: item.quotationId }
        });
      }
    }

    // 3. Gastos
    console.log('Restaurando Gastos...');
    const expCats = await remote.expenseCategory.findMany({ select: { id: true, name: true, description: true } });
    for (const ec of expCats) {
      await local.expenseCategory.upsert({ where: { id: ec.id }, update: { name: ec.name, description: ec.description }, create: { id: ec.id, name: ec.name, description: ec.description } });
    }
    const expenses = await remote.expense.findMany();
    for (const e of expenses) {
      await local.expense.upsert({
        where: { id: e.id },
        update: { description: e.description, amount: e.amount, date: e.date, categoryId: e.categoryId, paymentMethod: e.paymentMethod },
        create: { id: e.id, description: e.description, amount: e.amount, date: e.date, categoryId: e.categoryId, paymentMethod: e.paymentMethod }
      });
    }

    // 4. Compras (Purchase Orders)
    console.log('Restaurando Compras...');
    const purchases = await remote.purchase.findMany({ include: { items: true } });
    for (const pur of purchases) {
      await local.purchase.upsert({
        where: { id: pur.id },
        update: { total: pur.total, status: pur.status, supplierId: pur.supplierId, createdAt: pur.createdAt },
        create: { id: pur.id, total: pur.total, status: pur.status, supplierId: pur.supplierId, createdAt: pur.createdAt }
      });
      for (const item of pur.items) {
        await local.purchaseItem.upsert({
          where: { id: item.id },
          update: { quantity: item.quantity, costPrice: item.costPrice, productId: item.productId, purchaseId: item.purchaseId },
          create: { id: item.id, quantity: item.quantity, costPrice: item.costPrice, productId: item.productId, purchaseId: item.purchaseId }
        });
      }
    }

    // 5. Créditos
    console.log('Restaurando Créditos y Cobranzas...');
    const creditSales = await remote.creditSale.findMany();
    for (const cs of creditSales) {
      await local.creditSale.upsert({
        where: { id: cs.id },
        update: { saleId: cs.saleId, totalAmount: cs.totalAmount, remainingAmount: cs.remainingAmount, status: cs.status, dueDate: cs.dueDate },
        create: { id: cs.id, saleId: cs.saleId, totalAmount: cs.totalAmount, remainingAmount: cs.remainingAmount, status: cs.status, dueDate: cs.dueDate }
      });
    }

    // 6. Kardex (StockMovements)
    console.log('Restaurando Movimientos de Kardex...');
    const movements = await remote.stockMovement.findMany();
    for (const sm of movements) {
      await local.stockMovement.upsert({
        where: { id: sm.id },
        update: { productId: sm.productId, type: sm.type, quantity: sm.quantity, reason: sm.reason, createdAt: sm.createdAt },
        create: { id: sm.id, productId: sm.productId, type: sm.type, quantity: sm.quantity, reason: sm.reason, createdAt: sm.createdAt }
      });
    }

    // 7. Auditoría
    console.log('Restaurando Logs de Auditoría...');
    const logs = await remote.auditLog.findMany();
    for (const log of logs) {
      await local.auditLog.upsert({
        where: { id: log.id },
        update: { userId: log.userId, module: log.module, action: log.action, description: log.description, createdAt: log.createdAt },
        create: { id: log.id, userId: log.userId, module: log.module, action: log.action, description: log.description, createdAt: log.createdAt }
      });
    }

    console.log('--- RESTAURACIÓN TOTAL COMPLETADA ---');
  } catch (error) {
    console.error('Error durante la restauración total:', error);
  } finally {
    await remote.$disconnect();
    await local.$disconnect();
  }
}

fullRestore();
