import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('promotions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // 1. Static/Specific Routes first
  @Get('all')
  @RequirePermissions('promotions:read')
  getAllPromotions() {
    return this.promotionsService.getAllPromotions();
  }

  @Get('coupons')
  @RequirePermissions('promotions:read')
  getCoupons() {
    return this.promotionsService.getCoupons();
  }

  @Get('coupons/validate')
  @RequirePermissions('pos:read')
  validateCoupon(
    @Query('code') code: string,
    @Query('amount') amount: string
  ) {
    return this.promotionsService.validateCoupon(code, parseFloat(amount));
  }

  // 2. Resource creation
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

  // 3. Status Management
  @Patch('coupons/:id/toggle')
  @RequirePermissions('promotions:update')
  toggleCouponStatus(@Param('id') id: string) {
    return this.promotionsService.toggleCouponStatus(id);
  }

  @Patch(':id/toggle')
  @RequirePermissions('promotions:update')
  togglePromotionStatus(@Param('id') id: string) {
    return this.promotionsService.togglePromotionStatus(id);
  }

  // 4. Resource updates
  @Patch('coupons/:id')
  @RequirePermissions('promotions:update')
  updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.promotionsService.updateCoupon(id, data);
  }

  @Patch(':id')
  @RequirePermissions('promotions:update')
  updatePromotion(@Param('id') id: string, @Body() data: any) {
    return this.promotionsService.updatePromotion(id, data);
  }

  // 5. Default/Catch-all
  @Get()
  @RequirePermissions('promotions:read')
  getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  @Get('loyalty/:customerId')
  @RequirePermissions('pos:read')
  getCustomerPoints(@Param('customerId') customerId: string) {
    return this.promotionsService.getCustomerPoints(customerId);
  }
}
