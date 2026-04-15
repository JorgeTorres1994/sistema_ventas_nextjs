import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    async create(@Request() req, @Body() body: {
        items: { productId: string; quantity: number }[],
        customerId?: string,
        amountPaid?: number,
        paymentMethod?: string,
        status?: 'PAID' | 'PENDING' | 'PARTIAL'
    }) {
        return this.salesService.createSale(
            req.user.userId,
            body.items,
            body.customerId,
            body.amountPaid,
            body.paymentMethod,
            body.status
        );
    }

    @Get()
    async findAll(@Query() query: { 
        startDate?: string; 
        endDate?: string; 
        status?: string; 
        customerId?: string;
        search?: string;
    }) {
        return this.salesService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Patch(':id/cancel')
    async cancel(@Param('id') id: string) {
        return this.salesService.cancelSale(id);
    }
}
