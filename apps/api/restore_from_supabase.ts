import { PrismaClient } from '@prisma/client';

async function restore() {
  const remote = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres:Sukitteiinayo1@db.tpwicvbekroujrossswp.supabase.co:5432/postgres' } }
  });
  const local = new PrismaClient();

  console.log('--- Iniciando Restauración Maestra desde Supabase ---');

  try {
    // Limpieza total antes de restaurar
    console.log('Limpiando base de datos local...');
    await local.saleItem.deleteMany();
    await local.sale.deleteMany();
    await local.quotationItem.deleteMany();
    await local.quotation.deleteMany();
    await local.product.deleteMany();
    await local.category.deleteMany();
    await local.user.deleteMany();
    await local.role.deleteMany();

    // 1. Rescatar Roles y Usuarios
    const roles = await remote.role.findMany();
    const users = await remote.user.findMany();
    console.log(`Rescatando ${roles.length} roles y ${users.length} usuarios...`);

    for (const role of roles) {
      await local.role.upsert({
        where: { id: role.id },
        update: { name: role.name, description: role.description },
        create: { id: role.id, name: role.name, description: role.description }
      });
    }

    for (const user of users) {
      await local.user.upsert({
        where: { id: user.id },
        update: { 
          email: user.email, 
          name: user.name, 
          password: user.password,
          roleId: user.roleId,
          avatarUrl: user.avatarUrl,
          isActive: true
        },
        create: { 
          id: user.id,
          email: user.email, 
          name: user.name, 
          password: user.password,
          roleId: user.roleId,
          avatarUrl: user.avatarUrl,
          isActive: true
        }
      });
    }

    // 2. Rescatar Categorías y Productos
    const categories = await remote.category.findMany({
      select: { id: true, name: true }
    });
    const products = await remote.product.findMany({
      select: { id: true, name: true, description: true, price: true, stock: true, imageUrl: true, categoryId: true }
    });
    console.log(`Rescatando ${categories.length} categorías y ${products.length} productos...`);

    for (const cat of categories) {
      await local.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name, isActive: true },
        create: { id: cat.id, name: cat.name, isActive: true }
      });
    }

    for (const prod of products) {
      await local.product.upsert({
        where: { id: prod.id },
        update: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          categoryId: prod.categoryId,
          isActive: true
        },
        create: {
          id: prod.id,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          categoryId: prod.categoryId,
          isActive: true
        }
      });
    }

    // 3. Clientes
    const customers = await remote.customer.findMany({
      select: { id: true, name: true, dni: true, email: true, phone: true }
    });
    console.log(`Rescatando ${customers.length} clientes...`);
    for (const cust of customers) {
      await local.customer.upsert({
        where: { id: cust.id },
        update: { name: cust.name, dni: cust.dni, email: cust.email, phone: cust.phone, isActive: true },
        create: { id: cust.id, name: cust.name, dni: cust.dni, email: cust.email, phone: cust.phone, isActive: true }
      });
    }

    console.log('--- Restauración Completada con Éxito ---');
  } catch (error) {
    console.error('Error durante la restauración:', error);
  } finally {
    await remote.$disconnect();
    await local.$disconnect();
  }
}

restore();
