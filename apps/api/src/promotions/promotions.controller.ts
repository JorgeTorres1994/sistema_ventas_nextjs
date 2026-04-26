import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('promotions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @RequirePermissions('promotions:read')
  getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  @Get('coupons')
  @RequirePermissions('promotions:read')
  getCoupons() {
    return this.promotionsService.getCoupons();
  }

  @Post()
  @RequirePermissions('promotions:create')
  createPromotion(@Body() data: any) {
    return this.promotionsService.createPromotion(data);
  }

  @Post('coupons')
  @RequirePermissions('promotions:create')
  createCoupon(@Body() data: any) {
    return this.promotionsService.createCoupon(data);
  }

  @Get('coupons/validate')
  @RequirePermissions('pos:read')
  validateCoupon(
    @Query('code') code: string,
    @Query('amount') amount: string
  ) {
    return this.promotionsService.validateCoupon(code, parseFloat(amount));
  }

  @Get('loyalty/:customerId')
  @RequirePermissions('pos:read')
  getCustomerPoints(@Param('customerId') customerId: string) {
    return this.promotionsService.getCustomerPoints(customerId);
  }
}
