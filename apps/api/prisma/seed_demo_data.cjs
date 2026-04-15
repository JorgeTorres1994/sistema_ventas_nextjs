const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo products (JavaScript mode)...');

  // 1. Ensure Categories exist
  const categoriesData = [
    { name: 'Electronics' },
    { name: 'Home Decor' },
    { name: 'Kitchenware' },
  ];

  const categoryRecords = [];
  for (const cat of categoriesData) {
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
    const existing = await prisma.product.findFirst({
        where: { name: p.name }
    });

    if (existing) {
        await prisma.product.update({
            where: { id: existing.id },
            data: {
                ...p,
                isActive: true
            }
        });
        console.log(`Updated: ${p.name}`);
    } else {
        await prisma.product.create({
            data: {
                ...p,
                isActive: true
            }
        });
        console.log(`Created: ${p.name}`);
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
