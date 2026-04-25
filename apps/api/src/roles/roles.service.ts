import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                },
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        if (!role) throw new BadRequestException('Rol no encontrado');
        return role;
    }

    async findAllPermissions() {
        return this.prisma.permission.findMany({
            orderBy: [{ module: 'asc' }, { action: 'asc' }]
        });
    }

    async create(data: { name: string; description?: string; permissionIds: string[] }) {
        const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
        if (existing) throw new BadRequestException('Ya existe un rol con ese nombre');

        return this.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permissions: {
                    create: data.permissionIds.map(id => ({
                        permissionId: id
                    }))
                }
            }
        });
    }

    async update(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
        // 1. Update basic info
        await this.prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description
            }
        });

        // 2. Update permissions if provided
        if (data.permissionIds) {
            // Delete old ones
            await this.prisma.rolePermission.deleteMany({
                where: { roleId: id }
            });

            // Create new ones
            await this.prisma.role.update({
                where: { id },
                data: {
                    permissions: {
                        create: data.permissionIds.map(pid => ({
                            permissionId: pid
                        }))
                    }
                }
            });
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } }
        });

        if (role?._count && role._count.users > 0) {
            throw new BadRequestException('No se puede eliminar un rol que tiene usuarios asignados');
        }

        return this.prisma.role.delete({ where: { id } });
    }
}
