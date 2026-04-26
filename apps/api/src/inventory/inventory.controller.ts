import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get()
    async getStockOverview(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('stockStatus') stockStatus?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: string,
    ) {
        return this.inventoryService.getStockOverview({
            page: Number(page),
            limit: Number(limit),
            search,
            categoryId,
            stockStatus,
            sortBy,
            sortOrder,
        });
    }

    @Get('movements')
    async getMovements(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('productId') productId?: string,
        @Query('type') type?: string,
        @Query('reason') reason?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.inventoryService.getMovements({
            page: Number(page),
            limit: Number(limit),
            productId,
            type,
            reason,
            startDate,
            endDate,
        });
    }

    @Post('adjust')
    async adjustStock(
        @Body() body: {
            productId: string;
            quantity: number;
            type: 'IN' | 'OUT';
            reason?: string;
            unitCost?: number;
            note?: string;
        },
    ) {
        return this.inventoryService.adjustStock({
            ...body,
            quantity: Number(body.quantity),
            unitCost: body.unitCost ? Number(body.unitCost) : undefined
        });
    }

    @Get('kardex/:productId')
    async getKardex(
        @Param('productId') productId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.inventoryService.getKardex(productId, { startDate, endDate });
    }
}
