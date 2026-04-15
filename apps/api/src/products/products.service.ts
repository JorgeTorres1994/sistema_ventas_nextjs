import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(
        page: number = 1, 
        limit: number = 10, 
        search?: string, 
        categoryId?: string, 
        isActive?: boolean
    ): Promise<{ data: any[]; total: number }> {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { category: true }
            }),
            this.prisma.product.count({ where }),
        ]);
        return { data, total };
    }

    async create(data: {
        name: string;
        description?: string;
        price: number;
        purchasePrice?: number;
        stock: number;
        imageUrl?: string;
        categoryId?: string;
    }): Promise<Product> {
        return this.prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                purchasePrice: data.purchasePrice || 0,
                stock: data.stock,
                imageUrl: data.imageUrl,
                categoryId: data.categoryId,
            },
        });
    }

    async findOne(id: string): Promise<any> {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            description?: string;
            price?: number;
            purchasePrice?: number;
            stock?: number;
            imageUrl?: string;
            categoryId?: string;
            isActive?: boolean;
        },
    ): Promise<Product> {
        // Handle Stock Movement if stock changes
        if (data.stock !== undefined) {
            const currentProduct = await this.prisma.product.findUnique({ where: { id } });
            if (currentProduct && currentProduct.stock !== data.stock) {
                const diff = data.stock - currentProduct.stock;
                await this.prisma.stockMovement.create({
                    data: {
                        productId: id,
                        type: diff > 0 ? 'IN' : 'OUT',
                        quantity: Math.abs(diff),
                        reason: 'ADJUSTMENT',
                    }
                });
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                purchasePrice: data.purchasePrice,
                stock: data.stock,
                imageUrl: data.imageUrl,
                categoryId: data.categoryId,
                isActive: data.isActive,
            },
        });
    }

    async toggleActive(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Producto no encontrado');
        return this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
        });
    }

    async delete(id: string): Promise<Product> {
        return this.prisma.product.delete({
            where: { id },
        });
    }

    async findAllCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
}

