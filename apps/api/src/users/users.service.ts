import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { User, Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findAll(filters: { search?: string; role?: Role; isActive?: boolean } = {}): Promise<User[]> {
        const { search, role, isActive } = filters;
        return this.prisma.user.findMany({
            where: {
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ] : undefined,
                role,
                isActive,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async toggleStatus(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('Usuario no encontrado');
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
    }

    async remove(id: string): Promise<User> {
        return this.prisma.user.delete({ where: { id } });
    }
}
