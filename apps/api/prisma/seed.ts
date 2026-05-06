import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const products = [
        {
            name: 'Camiseta de Algodón Premium',
            description: 'Camiseta 100% algodón, suave y transpirable para uso diario.',
            price: 19.99,
            stock: 150,
            category: 'Camisetas',
            imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Jeans Slim Fit Clásicos',
            description: 'Pantalones vaqueros de corte ajustado, duraderos y cómodos.',
            price: 45.50,
            stock: 80,
            category: 'Pantalones',
            imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Chaqueta de Cuero Sintético',
            description: 'Chaqueta elegante y moderna, ideal para climas frescos.',
            price: 89.00,
            stock: 25,
            category: 'Abrigos',
            imageUrl: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Sudadera con Capucha (Hoodie)',
            description: 'Sudadera cálida con forro polar interior y bolsillo canguro.',
            price: 34.99,
            stock: 120,
            category: 'Deportiva',
            imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Vestido de Verano Floral',
            description: 'Vestido ligero con estampado floral, perfecto para días soleados.',
            price: 39.50,
            stock: 45,
            category: 'Vestidos',
            imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Camisa Formal de Botones',
            description: 'Camisa de corte impecable para ocasiones especiales o trabajo.',
            price: 29.90,
            stock: 65,
            category: 'Camisas',
            imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Pantalones Chino Casual',
            description: 'Pantalones de tela versátiles para un look semi-informal.',
            price: 38.00,
            stock: 55,
            category: 'Pantalones',
            imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Abrigo de Lana Elegante',
            description: 'Abrigo largo de lana para un invierno con estilo.',
            price: 120.00,
            stock: 15,
            category: 'Abrigos',
            imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Falda de Jean de Cintura Alta',
            description: 'Falda clásica que combina con todo.',
            price: 24.50,
            stock: 40,
            category: 'Faldas',
            imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Jersey de Punto Suave',
            description: 'Suéter cómodo para los días más fríos.',
            price: 32.00,
            stock: 90,
            category: 'Suéteres',
            imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Blusa de Seda Estampada',
            description: 'Blusa fluida y elegante con diseño exclusivo.',
            price: 48.00,
            stock: 30,
            category: 'Camisas',
            imageUrl: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Pantalones Cortos Deportivos',
            description: 'Shorts de secado rápido ideales para el gym o correr.',
            price: 22.99,
            stock: 110,
            category: 'Deportiva',
            imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Chaqueta Impermeable Ligera',
            description: 'Protección contra la lluvia sin perder el estilo.',
            price: 55.00,
            stock: 20,
            category: 'Abrigos',
            imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Calcetines Pack de 5',
            description: 'Pack de calcetines de algodón reforzados.',
            price: 12.99,
            stock: 200,
            category: 'Accesorios',
            imageUrl: 'https://images.unsplash.com/photo-1582966772640-def60237d263?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Traje de Baño Moderno',
            description: 'Diseño cómodo y resistente al cloro.',
            price: 28.50,
            stock: 50,
            category: 'Deportiva',
            imageUrl: 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Sombrero de Fieltro Clásico',
            description: 'Accesorio perfecto para un toque sofisticado.',
            price: 35.00,
            stock: 18,
            category: 'Accesorios',
            imageUrl: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Botas de Cuero para Hombre',
            description: 'Calzado resistente y elegante para cualquier ocasión.',
            price: 95.00,
            stock: 22,
            category: 'Calzado',
            imageUrl: 'https://images.unsplash.com/photo-1520639889410-1dfbc2947103?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Bufanda de Cachemira',
            description: 'Lujo y suavidad extrema para protegerte del frío.',
            price: 49.99,
            stock: 35,
            category: 'Accesorios',
            imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop',
        },
    ];

    console.log('Limpiando la base de datos...');
    // Relaciones de segundo nivel / dependencias directas
    await prisma.quotationItem.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.creditPayment.deleteMany();
    await prisma.creditSale.deleteMany();
    await prisma.creditPurchase.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.purchaseItem.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.productPromotion.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.cashMovement.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.cashRegister.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    // await prisma.role.deleteMany(); // Mantenemos los roles para evitar conflictos si ya están definidos

    console.log('Creando roles base...');
    let adminRole = await prisma.role.findFirst({ where: { name: 'Administrador' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'Administrador',
                description: 'Acceso total al sistema'
            }
        });
    }

    console.log('Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            email: 'admin@admin.com',
            password: hashedPassword,
            name: 'Jorge Torres',
            roleId: adminRole.id,
        },
    });

    console.log('Creando permisos y asignando al Administrador...');
    const modules = [
        'dashboard', 'pos', 'cash', 'sales', 'expenses', 'credits', 
        'customers', 'products', 'inventory', 'suppliers', 
        'purchases', 'promotions', 'reports', 'audit', 'users', 'roles', 'settings'
    ];
    const actions = ['read', 'create', 'update', 'delete'];

    for (const module of modules) {
        for (const action of actions) {
            const p = await (prisma as any).permission.create({
                data: {
                    name: `${module}:${action}`,
                    module,
                    action,
                    description: `Permiso para ${action} en el módulo ${module}`
                }
            });
            await (prisma as any).rolePermission.create({
                data: {
                    roleId: adminRole.id,
                    permissionId: p.id
                }
            });
        }
    }

    console.log('Iniciando el seeding de ropa con categorías...');
    for (const item of products) {
        let categoryRecord = await (prisma as any).category.findUnique({ where: { name: item.category } });
        if (!categoryRecord) {
            categoryRecord = await (prisma as any).category.create({ data: { name: item.category } });
        }

        await (prisma as any).product.create({
            data: {
                name: item.name,
                description: item.description,
                price: item.price,
                stock: item.stock,
                imageUrl: item.imageUrl,
                categoryId: (categoryRecord as any).id
            },
        });
    }

    // Create a default Document Series
    console.log('Creando series de documentos por defecto...');
    const seriesData = [
        { documentType: 'BOLETA', prefix: 'B001', startNumber: 1, currentNumber: 0, description: 'Boleta de Venta Electrónica' },
        { documentType: 'FACTURA', prefix: 'F001', startNumber: 1, currentNumber: 0, description: 'Factura Electrónica' }
    ];

    for (const s of seriesData) {
        await (prisma as any).documentSeries.create({ data: s });
    }

    console.log('Seeding completado con éxito.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
