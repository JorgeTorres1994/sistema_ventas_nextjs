import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const { categoryId, cashRegisterId, date, ...rest } = data;

    // Normalizar fecha para Prisma DateTime (ISO Date)
    let parsedDate: Date;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date();
      }
    } else {
      parsedDate = new Date();
    }

    // Validar cashRegisterId si no está vacío
    const validCashRegisterId =
      cashRegisterId &&
      typeof cashRegisterId === 'string' &&
      cashRegisterId.trim() !== ''
        ? cashRegisterId.trim()
        : null;

    // Si es un gasto de caja, verificar que la caja exista y esté abierta
    if (validCashRegisterId) {
      const register = await this.prisma.cashRegister.findUnique({
        where: { id: validCashRegisterId },
      });
      if (!register || register.status !== 'OPEN') {
        throw new BadRequestException(
          'La caja debe estar abierta para registrar un gasto desde ella',
        );
      }
    }

    // BUG-07 FIX: usar transacción para crear el gasto Y el movimiento de caja atómicamente
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          ...rest,
          date: parsedDate,
          category: { connect: { id: categoryId } },
          ...(validCashRegisterId && {
            cashRegister: { connect: { id: validCashRegisterId } },
          }),
        },
        include: { category: true },
      });

      // Si hay caja vinculada, registrar el egreso en los movimientos de caja
      if (validCashRegisterId) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: validCashRegisterId,
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
    const { date, categoryId, cashRegisterId, ...rest } = data;
    const validCashRegisterId =
      cashRegisterId &&
      typeof cashRegisterId === 'string' &&
      cashRegisterId.trim() !== ''
        ? cashRegisterId.trim()
        : null;

    let parsedDate: Date | undefined = undefined;
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        ...(parsedDate && { date: parsedDate }),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(validCashRegisterId !== undefined && {
          cashRegister: validCashRegisterId
            ? { connect: { id: validCashRegisterId } }
            : { disconnect: true },
        }),
      },
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
    const count = await this.prisma.expense.count({
      where: { categoryId: id },
    });
    if (count > 0)
      throw new BadRequestException(
        'No se puede eliminar una categoría con gastos asociados',
      );

    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }
}
