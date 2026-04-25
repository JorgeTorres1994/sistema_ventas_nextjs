import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seeding de Roles y Permisos...');

    // 1. Definir Módulos y Acciones
    const modules = [
        'dashboard', 'pos', 'cash', 'sales', 'customers', 
        'products', 'inventory', 'suppliers', 'purchases', 
        'reports', 'users', 'roles', 'settings', 'expenses'
    ];
    const actions = ['read', 'create', 'update', 'delete'];

    // 2. Crear todos los Permisos
    const allPermissions: any[] = [];
    for (const module of modules) {
        for (const action of actions) {
            const name = `${module}:${action}`;
            const permission = await prisma.permission.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    module,
                    action,
                    description: `Permite ${action} en el módulo ${module}`
                }
            });
            allPermissions.push(permission);
        }
    }

    // 3. Crear Rol Administrador (Todos los permisos)
    const adminRole = await prisma.role.upsert({
        where: { name: 'Administrador' },
        update: {},
        create: {
            name: 'Administrador',
            description: 'Acceso total al sistema'
        }
    });

    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id
                }
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id
            }
        });
    }

    // 4. Crear Rol Vendedor (Permisos limitados)
    const sellerRole = await prisma.role.upsert({
        where: { name: 'Vendedor' },
        update: {},
        create: {
            name: 'Vendedor',
            description: 'Personal de ventas y atención al cliente'
        }
    });

    const sellerPerms = [
        'dashboard:read', 'pos:read', 'pos:create', 'sales:read', 'sales:create', 
        'customers:read', 'customers:create', 'products:read'
    ];

    for (const permName of sellerPerms) {
        const perm = allPermissions.find((p: any) => p.name === permName);
        if (perm) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: sellerRole.id,
                        permissionId: perm.id
                    }
                },
                update: {},
                create: {
                    roleId: sellerRole.id,
                    permissionId: perm.id
                }
            });
        }
    }

    // 5. Crear Rol Almacenero
    const warehouseRole = await prisma.role.upsert({
        where: { name: 'Almacenero' },
        update: {},
        create: {
            name: 'Almacenero',
            description: 'Gestión de inventarios y proveedores'
        }
    });

    const warehousePerms = [
        'dashboard:read', 'products:read', 'inventory:read', 'inventory:update', 
        'suppliers:read', 'suppliers:create', 'purchases:read', 'purchases:create'
    ];

    for (const permName of warehousePerms) {
        const perm = allPermissions.find((p: any) => p.name === permName);
        if (perm) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: warehouseRole.id,
                        permissionId: perm.id
                    }
                },
                update: {},
                create: {
                    roleId: warehouseRole.id,
                    permissionId: perm.id
                }
            });
        }
    }

    // 6. Actualizar usuario administrador existente o crear uno
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {
            roleId: adminRole.id
        },
        create: {
            email: 'admin@admin.com',
            password: hashedPassword,
            name: 'Jorge Torres',
            roleId: adminRole.id
        }
    });

    // 7. Configurar Series de Documentos Iniciales
    const series = [
        { type: 'FACTURA', prefix: 'F001', start: 1, desc: 'Factura Electrónica' },
        { type: 'BOLETA', prefix: 'B001', start: 1, desc: 'Boleta de Venta' },
        { type: 'NOTA_CREDITO', prefix: 'NC01', start: 1, desc: 'Nota de Crédito' }
    ];

    for (const s of series) {
        await prisma.documentSeries.upsert({
            where: { id: `series-${s.type}` },
            update: {},
            create: {
                id: `series-${s.type}`,
                documentType: s.type,
                prefix: s.prefix,
                startNumber: s.start,
                currentNumber: s.start - 1,
                description: s.desc
            }
        });
    }

    console.log('Seeding de Roles, Permisos y Series completado con éxito.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
