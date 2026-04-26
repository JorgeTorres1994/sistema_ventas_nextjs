
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSimulation() {
  console.log('--- AUDITORÍA DE SIMULACIÓN ---');
  
  const products = await prisma.product.findMany({ where: { name: { contains: 'Audífonos' } } });
  console.log('Productos creados:', products.map(p => `${p.name} - Stock: ${p.stock}`));

  const suppliers = await prisma.supplier.findMany({ where: { name: { contains: 'Distribuidora' } } });
  console.log('Proveedores creados:', suppliers.map(s => s.name));

  const purchases = await prisma.purchase.findMany({ include: { items: true } });
  console.log('Compras registradas:', purchases.length);

  const customers = await prisma.customer.findMany({ where: { name: { contains: 'Maria' } } });
  console.log('Clientes creados:', customers.map(c => c.name));

  const sales = await prisma.sale.findMany({ include: { items: true } });
  console.log('Ventas registradas:', sales.length);

  const registers = await prisma.cashRegister.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  console.log('Cajas (últimas 2):', registers.map(r => `ID: ${r.id}, Status: ${r.status}, Open: ${r.openingBalance}, Close: ${r.closingBalance}`));

  const movements = await prisma.cashMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Movimientos de caja (últimos 5):', movements.map(m => `${m.type}: ${m.amount} - ${m.description}`));
}

checkSimulation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
