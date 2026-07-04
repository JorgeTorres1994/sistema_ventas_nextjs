import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    create(@Body() createPurchaseDto: {
        supplierId: string;
        items: { productId: string; quantity: number; costPrice: number }[];
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        notes?: string;
        expectedDelivery?: string;
        shippingCost?: number;
        taxAmount?: number;
        subtotal?: number;
        total: number;
    }) {
        return this.purchasesService.create(createPurchaseDto);
    }

    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('status') status?: string,
        @Query('supplierId') supplierId?: string,
        @Query('search') search?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.purchasesService.findAll({
            page: Number(page),
            limit: Number(limit),
            status,
            supplierId,
            search,
            startDate,
            endDate,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    // BUG-02 FIX: endpoint para completar una compra PENDING y actualizar el inventario
    @Patch(':id/complete')
    complete(@Param('id') id: string) {
        return this.purchasesService.completePurchase(id);
    }
}
