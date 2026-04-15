import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo products...');

  // 1. Ensure Categories exist
  const categories = [
    { name: 'Electronics' },
    { name: 'Home Decor' },
    { name: 'Kitchenware' },
  ];

  const categoryRecords: any[] = [];
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    categoryRecords.push(record);
    console.log(`Category ensured: ${cat.name}`);
  }

  const electronicsId = categoryRecords.find(c => c.name === 'Electronics')?.id;
  const decorId = categoryRecords.find(c => c.name === 'Home Decor')?.id;
  const kitchenId = categoryRecords.find(c => c.name === 'Kitchenware')?.id;

  // 2. Demo Products Data
  const demoProducts = [
    // Electronics
    {
      name: 'Studio Wireless X1',
      description: 'High-fidelity audio with active noise cancellation.',
      price: 299.99,
      purchasePrice: 150.00,
      stock: 42,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      categoryId: electronicsId,
    },
    {
      name: 'Nebula S24 Pro',
      description: 'Latest flagship smartphone with 8K camera.',
      price: 999.00,
      purchasePrice: 600.00,
      stock: 56,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop',
      categoryId: electronicsId,
    },
    {
      name: 'Ultra Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with blue switches.',
      price: 129.50,
      purchasePrice: 45.00,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop',
      categoryId: electronicsId,
    },

    // Home Decor
    {
      name: 'Minimalist Ceramic Vase',
      description: 'Handcrafted white ceramic vase for modern interiors.',
      price: 45.00,
      purchasePrice: 12.00,
      stock: 24,
      imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=1000&auto=format&fit=crop',
      categoryId: decorId,
    },
    {
      name: 'Modern Floor Lamp',
      description: 'Sleek floor lamp with adjustable LED brightness.',
      price: 189.00,
      purchasePrice: 75.00,
      stock: 4,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
      categoryId: decorId,
    },
    {
      name: 'Nordic Wool Rug',
      description: 'Soft, minimalist rug for living room comfort.',
      price: 250.00,
      purchasePrice: 110.00,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f505?q=80&w=1000&auto=format&fit=crop',
      categoryId: decorId,
    },

    // Kitchenware
    {
      name: 'Chef Professional 10-Piece Set',
      description: 'Stainless steel cookware set for professional results.',
      price: 499.00,
      purchasePrice: 220.00,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1584990344610-529c59582b5d?q=80&w=1000&auto=format&fit=crop',
      categoryId: kitchenId,
    },
    {
      name: 'Cast Iron Signature Skillet',
      description: 'Pre-seasoned cast iron skillet for perfect searing.',
      price: 89.00,
      purchasePrice: 35.00,
      stock: 3,
      imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000&auto=format&fit=crop',
      categoryId: kitchenId,
    },
    {
      name: 'Precision Knife Block',
      description: 'Japanese steel 7-knife set with wooden block.',
      price: 145.00,
      purchasePrice: 55.00,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1550920551-787265696660?q=80&w=1000&auto=format&fit=crop',
      categoryId: kitchenId,
    },
  ];

  for (const p of demoProducts) {
    // Check if product exists by name to avoid duplicates
    const existing = await prisma.product.findFirst({
        where: { name: p.name }
    });

    const productData: any = {
        name: p.name,
        description: p.description,
        price: p.price,
        purchasePrice: p.purchasePrice,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        isActive: true
    };

    if (existing) {
        await prisma.product.update({
            where: { id: existing.id },
            data: productData
        });
        console.log(`Updated: ${p.name}`);
    } else {
        await prisma.product.create({
            data: productData
        });
        console.log(`Created: ${p.name}`);
    }
  }

  // 3. Demo Customers
  const demoCustomers = [
    { name: 'Elena Rodriguez', dni: '48.291.002-K', email: 'elena.rod@example.com', phone: '+34 612 901 882', address: 'Calle Mayor 12, Madrid' },
    { name: 'Marcus Thorne', dni: '33.551.990-A', email: 'm.thorne@tech-sphere.io', phone: '+44 7700 90021', address: '221B Baker St, London' },
    { name: 'Sarah Jenkins', dni: '19.202.445-Z', email: 's.jenkins@creative.com', phone: '+1 212 555 0198', address: '5th Ave 101, New York' },
    { name: 'Dr. Linda Gray', dni: '10.003.882-M', email: 'linda.gray@medical.org', phone: '+49 30 1234567', address: 'Alexanderplatz 1, Berlin' },
    { name: 'Julianne Sterling', dni: '45.112.887-L', email: 'j.sterling@lumen.io', phone: '+1 (555) 902-4411', address: 'Silicon Valley, CA' },
  ];

  const customerRecords: any[] = [];
  for (const c of demoCustomers) {
    const record = await prisma.customer.upsert({
      where: { dni: c.dni },
      update: {},
      create: { ...c, isActive: true },
    });
    customerRecords.push(record);
    console.log(`Customer ensured: ${c.name}`);
  }

  // 3b. Demo Suppliers
  const demoSuppliers = [
    { name: 'Lumina Tech Solutions', dniRuc: '20534219800', email: 's.jenkins@lumina.io', phone: '+1 415 555 0100', address: 'Silicon Valley, CA' },
    { name: 'Vanguard Apparel', dniRuc: '20455588301', email: 'm.rossi@vanguard.co', phone: '+39 06 6869101', address: 'Via Roma, Milan', isActive: false },
    { name: 'Nexus Logistics', dniRuc: '20199944011', email: 'e.vance@nexus.com', phone: '+44 20 7946 0958', address: 'London, UK' },
    { name: 'Aether Optics', dniRuc: '20938477544', email: 'wu.d@aether.net', phone: '+86 10 5555 0000', address: 'Beijing, China' },
  ];

  const supplierRecords: any[] = [];
  for (const s of demoSuppliers) {
    const record = await prisma.supplier.upsert({
      where: { dniRuc: s.dniRuc },
      update: {},
      create: { ...s },
    });
    supplierRecords.push(record);
    console.log(`Supplier ensured: ${s.name}`);
  }

  // 4. Ensure a User exists to assign the Sale
  let defaultUser = await prisma.user.findFirst();
  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        email: 'admin@nexus.com',
        password: 'password123', // In a real app use hashing, but for seed it works
        name: 'Super Admin',
        role: 'ADMIN',
      }
    });
    console.log('Created default admin user for seeding.');
  }

  // 5. Create some dummy Sales/Movements so metrics show up
  const products = await prisma.product.findMany();
  const elena = customerRecords.find(c => c.name === 'Elena Rodriguez');
  
  if (elena && products.length > 0) {
    const existingSale = await prisma.sale.findFirst({ where: { customerId: elena.id } });
    if (!existingSale) {
        console.log('Creating demo sale for Elena...');
        await prisma.sale.create({
            data: {
                customerId: elena.id,
                userId: defaultUser.id,
                total: 1299.00,
                amountPaid: 1299.00,
                status: 'PAID', // Correct PaymentStatus enum
                items: {
                    create: [
                        { productId: products[0].id, quantity: 1, price: products[0].price },
                        { productId: products[1].id, quantity: 1, price: products[1].price },
                    ]
                }
            } as any
        });
    }
  }

  // 6. Create some dummy Purchases for Suppliers to show stats
  const lumina = supplierRecords.find(s => s.name === 'Lumina Tech Solutions');
  
  if (lumina && products.length > 0) {
    const existingPurchase = await prisma.purchase.findFirst({ where: { supplierId: lumina.id } });
    if (!existingPurchase) {
        console.log('Creating demo purchase for Lumina...');
        await prisma.purchase.create({
            data: {
                supplierId: lumina.id,
                total: 12400.00,
                status: 'COMPLETED',
                items: {
                    create: [
                        { productId: products[0].id, quantity: 50, costPrice: 150.00 },
                    ]
                }
            }
        });
        await prisma.purchase.create({
            data: {
                supplierId: lumina.id,
                total: 4250.00,
                status: 'PENDING',
                items: {
                    create: [
                        { productId: products[1].id, quantity: 10, costPrice: 425.00 },
                    ]
                }
            }
        });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

