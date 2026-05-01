import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:12345678@localhost:5432/sistema_ventas_db?schema=public" } }
});

const remotePrisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:Sukitteiinayo1@db.tpwicvbekroujrossswp.supabase.co:6543/postgres?pgbouncer=true" } }
});

async function migrate() {
  console.log('🚀 INICIANDO MIGRACIÓN MAESTRA (TODOS LOS MÓDULOS)...');

  try {
    const migrateTable = async (name: string, model: any, uniqueKey: string = 'id', include: any = null) => {
      console.log(`📦 Migrando ${name}...`);
      const items = await (localPrisma as any)[model].findMany({ include });
      for (const item of items) {
        try {
          const { ...data } = item;
          // Handle nested includes if any (like items in Sale)
          const where = { [uniqueKey]: (item as any)[uniqueKey] };
          await (remotePrisma as any)[model].upsert({
            where,
            update: data,
            create: data
          });
        } catch (e) {
          console.warn(`⚠️ Error en item de ${name}:`, e.message);
        }
      }
    };

    // 1. Core Structure
    await migrateTable('Roles', 'role', 'name');
    await migrateTable('Permisos', 'permission', 'name');
    
    // RolePermission (Composite key, handle manually)
    console.log('📦 Migrando Permisos de Roles...');
    const rp = await localPrisma.rolePermission.findMany();
    for (const item of rp) {
      await remotePrisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: item.roleId, permissionId: item.permissionId } },
        update: item,
        create: item
      });
    }

    await migrateTable('Usuarios', 'user', 'email');
    await migrateTable('Categorías', 'category', 'name');
    await migrateTable('Productos', 'product');
    await migrateTable('Clientes', 'customer', 'dni');
    await migrateTable('Proveedores', 'supplier', 'dniRuc');
    
    // 2. Marketing & Loyalty
    await migrateTable('Cupones', 'coupon', 'code');
    await migrateTable('Promociones', 'promotion');
    
    // ProductPromotion (Composite key)
    console.log('📦 Migrando Promociones de Productos...');
    const pp = await localPrisma.productPromotion.findMany();
    for (const item of pp) {
      await remotePrisma.productPromotion.upsert({
        where: { productId_promotionId: { productId: item.productId, promotionId: item.promotionId } },
        update: item,
        create: item
      });
    }

    // 3. Transactions & Inventory
    await migrateTable('Cajas', 'cashRegister');
    await migrateTable('Movimientos de Caja', 'cashMovement');
    await migrateTable('Ventas', 'sale');
    await migrateTable('Items de Venta', 'saleItem');
    await migrateTable('Pagos', 'payment');
    await migrateTable('Compras', 'purchase');
    await migrateTable('Items de Compra', 'purchaseItem');
    await migrateTable('Kardex (Movimientos)', 'stockMovement');
    await migrateTable('Cotizaciones', 'quotation', 'number');
    await migrateTable('Items de Cotización', 'quotationItem');

    // 4. Finance & Expenses
    await migrateTable('Categorías de Gastos', 'expenseCategory', 'name');
    await migrateTable('Gastos', 'expense');
    await migrateTable('Créditos de Ventas', 'creditSale', 'saleId');
    await migrateTable('Créditos de Compras', 'creditPurchase', 'purchaseId');
    await migrateTable('Pagos de Créditos', 'creditPayment');

    // 5. Audit & Settings
    await migrateTable('Logs de Auditoría', 'auditLog');
    await migrateTable('Ajustes', 'setting');
    await migrateTable('Series de Documentos', 'documentSeries');
    await migrateTable('Métodos de Pago', 'paymentMethod', 'name');

    console.log('✅ ¡MIGRACIÓN INTEGRAL COMPLETADA CON ÉXITO!');
  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

migrate();
