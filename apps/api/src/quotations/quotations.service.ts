import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { SalesService } from '../sales/sales.service.js';

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private salesService: SalesService,
  ) {}

  async createQuotation(userId: string, data: any) {
    try {
      const { items, customerId, notes, expirationDays = 7 } = data;
      
      // Generate quotation number (e.g., COT-00001)
      const count = await (this.prisma as any).quotation.count();
      const number = `COT-${(count + 1).toString().padStart(5, '0')}`;
      
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      let subtotal = 0;
      const quotationItems: any[] = [];

      for (const item of items) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        
        const price = Number(product.price);
        subtotal += price * item.quantity;
        
        quotationItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: price,
        });
      }

      const taxRate = 18; // Default IGV
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      return await (this.prisma as any).quotation.create({
        data: {
          number,
          subtotal,
          taxAmount,
          total,
          notes,
          expirationDate,
          userId,
          customerId,
          items: {
            create: quotationItems,
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  async findAll(filters: any) {
    try {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.customerId) where.customerId = filters.customerId;
      if (filters.search) {
        where.OR = [
          { number: { contains: filters.search, mode: 'insensitive' } },
          { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      return await (this.prisma as any).quotation.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error finding quotations:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const quotation = await (this.prisma as any).quotation.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        user: { select: { name: true } },
      },
    });
    if (!quotation) throw new NotFoundException('Cotización no encontrada');
    return quotation;
  }

  async updateStatus(id: string, status: string) {
    return (this.prisma as any).quotation.update({
      where: { id },
      data: { status },
    });
  }

  async convertToSale(id: string, userId: string, paymentMethod: string = 'CASH') {
    const quotation = await this.findOne(id);
    
    if (quotation.status === 'CONVERTED') {
      throw new BadRequestException('Esta cotización ya fue convertida en venta');
    }

    if (new Date() > quotation.expirationDate) {
      throw new BadRequestException('La cotización ha expirado');
    }

    // Prepare items for SalesService
    const saleItems = quotation.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // Create the sale
    const sale = await this.salesService.createSale(
      userId,
      saleItems,
      quotation.customerId,
      Number(quotation.total),
      paymentMethod,
      'PAID'
    );

    // Update quotation status
    await this.updateStatus(id, 'CONVERTED');

    return sale;
  }
}
