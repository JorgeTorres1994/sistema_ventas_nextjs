import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { QuotationsService } from './quotations.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.quotationsService.createQuotation(req.user.userId, data);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.quotationsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.quotationsService.updateStatus(id, status);
  }

  @Post(':id/convert')
  convertToSale(@Param('id') id: string, @Request() req, @Body('paymentMethod') paymentMethod: string) {
    return this.quotationsService.convertToSale(id, req.user.userId, paymentMethod);
  }
}
