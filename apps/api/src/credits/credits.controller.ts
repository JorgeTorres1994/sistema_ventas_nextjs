import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('credits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('receivables')
  @RequirePermissions('credits:read')
  getReceivables(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.creditsService.getReceivables({ status, customerId, search });
  }

  @Get('receivables/:id')
  @RequirePermissions('credits:read')
  getReceivableById(@Param('id') id: string) {
    return this.creditsService.getReceivableById(id);
  }

  @Get('payables')
  @RequirePermissions('credits:read')
  getPayables(
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
  ) {
    return this.creditsService.getPayables({ status, supplierId, search });
  }

  @Get('payables/:id')
  @RequirePermissions('credits:read')
  getPayableById(@Param('id') id: string) {
    return this.creditsService.getPayableById(id);
  }

  @Post('payments')
  @RequirePermissions('credits:create')
  recordPayment(@Body() data: {
    amount: number;
    paymentMethod: string;
    notes?: string;
    creditSaleId?: string;
    creditPurchaseId?: string;
    cashRegisterId?: string;
  }) {
    return this.creditsService.recordPayment(data);
  }
}
