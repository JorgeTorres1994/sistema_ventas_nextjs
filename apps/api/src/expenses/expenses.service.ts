import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) {
    const { startDate, endDate, categoryId } = params;
    return this.prisma.expense.findMany({
      where: {
        categoryId: categoryId || undefined,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  async create(data: any) {
    const { categoryId, cashRegisterId, ...rest } = data;

    // If it's a cash expense, we might want to check the register
    if (cashRegisterId) {
      const register = await this.prisma.cashRegister.findUnique({
        where: { id: cashRegisterId },
      });
      if (!register || register.status !== 'OPEN') {
        throw new Error('La caja debe estar abierta para registrar un gasto desde ella');
      }
    }

    // BUG-07 FIX: usar transacción para crear el gasto Y el movimiento de caja atómicamente
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          ...rest,
          category: { connect: { id: categoryId } },
          ...(cashRegisterId && { cashRegister: { connect: { id: cashRegisterId } } }),
        },
        include: { category: true },
      });

      // Si hay caja vinculada, registrar el egreso en los movimientos de caja
      if (cashRegisterId) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId,
            type: 'OUT',
            amount: rest.amount,
            description: `Gasto: ${rest.description || 'Sin descripción'}`,
          },
        });
      }

      return expense;
    });
  }

  async update(id: string, data: any) {
    return this.prisma.expense.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  // Categories
  async findAllCategories() {
    return this.prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: any) {
    return this.prisma.expenseCategory.create({
      data,
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.expenseCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    // Check if there are expenses in this category
    const count = await this.prisma.expense.count({ where: { categoryId: id } });
    if (count > 0) throw new Error('No se puede eliminar una categoría con gastos asociados');
    
    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }
}
