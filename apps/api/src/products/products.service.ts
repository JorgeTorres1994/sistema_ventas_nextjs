import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Product } from '@prisma/client';

import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

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
    }, userId?: string): Promise<Product> {
        const catId = (data.categoryId && data.categoryId !== 'undefined' && data.categoryId !== '') 
            ? data.categoryId 
            : null;

        const product = await this.prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                purchasePrice: data.purchasePrice || 0,
                stock: data.stock,
                imageUrl: data.imageUrl,
                categoryId: catId,
            },
        });

        if (userId) {
            await this.auditService.logAction(
                userId,
                'PRODUCTS',
                'CREATE',
                `Producto creado: ${product.name}`,
                { price: product.price, stock: product.stock }
            );
        }

        return product;
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
        userId?: string
    ): Promise<Product> {
        // BUG-06 FIX: registrar valores de valuación completos en el movimiento de stock
        if (data.stock !== undefined) {
            const currentProduct = await this.prisma.product.findUnique({ where: { id } });
            if (currentProduct && currentProduct.stock !== data.stock) {
                const diff = data.stock - currentProduct.stock;
                const unitCost = Number(currentProduct.purchasePrice) || 0;
                const prevStock = currentProduct.stock;
                const nextStock = data.stock;
                await this.prisma.stockMovement.create({
                    data: {
                        productId: id,
                        type: diff > 0 ? 'IN' : 'OUT',
                        quantity: Math.abs(diff),
                        unitCost,
                        totalCost: Math.abs(diff) * unitCost,
                        prevStock,
                        nextStock,
                        prevValue: prevStock * unitCost,
                        nextValue: nextStock * unitCost,
                        reason: 'ADJUSTMENT',
                    }
                });
            }
        }

        const catId = (data.categoryId && data.categoryId !== 'undefined' && data.categoryId !== '') 
            ? data.categoryId 
            : null;

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                purchasePrice: data.purchasePrice,
                stock: data.stock,
                imageUrl: data.imageUrl,
                categoryId: data.categoryId === undefined ? undefined : catId,
                isActive: data.isActive,
            },
        });

        if (userId) {
            await this.auditService.logAction(
                userId,
                'PRODUCTS',
                'UPDATE',
                `Producto actualizado: ${updatedProduct.name}`,
                { changes: data }
            );
        }

        return updatedProduct;
    }

    async toggleActive(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Producto no encontrado');
        return this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
        });
    }

    async delete(id: string, userId?: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        const deleted = await this.prisma.product.delete({
            where: { id },
        });

        if (userId && product) {
            await this.auditService.logAction(
                userId,
                'PRODUCTS',
                'DELETE',
                `Producto eliminado: ${product.name}`,
                { product }
            );
        }

        return deleted;
    }

    async findAllCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
}

