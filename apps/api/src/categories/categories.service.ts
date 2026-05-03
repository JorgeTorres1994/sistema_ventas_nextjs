import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el nombre ${data.name}`);
    }
    return this.prisma.category.create({ data });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true }
    });
    if (!category) throw new NotFoundException(`Categoría no encontrada`);
    return category;
  }

  async update(id: string, data: { name?: string; isActive?: boolean }) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría no encontrada`);

    if (data.name && data.name !== category.name) {
      const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
      if (existing) throw new ConflictException(`Ya existe otra categoría con el nombre ${data.name}`);
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ 
      where: { id },
      include: { _count: { select: { products: true } } }
    });
    if (!category) throw new NotFoundException(`Categoría no encontrada`);
    
    if (category._count.products > 0) {
      throw new ConflictException(`No se puede eliminar una categoría que tiene productos asociados`);
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
