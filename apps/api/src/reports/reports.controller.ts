import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('summary')
    getSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('customerId') customerId?: string,
        @Query('type') type?: string,
    ) {
        return this.reportsService.getSummary({ startDate, endDate, customerId, type });
    }

    @Get('charts')
    getCharts(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getCharts({ startDate, endDate });
    }

    @Get('top-products')
    getTopProducts(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getTopProducts({ startDate, endDate });
    }

    @Get('transactions')
    getTransactions(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getTransactions({ startDate, endDate });
    }

    @Get('dashboard')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }
}
