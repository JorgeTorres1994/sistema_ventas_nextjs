import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @RequirePermissions('expenses:read')
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.expensesService.findAll({ startDate, endDate, categoryId });
  }

  @Get('categories')
  @RequirePermissions('expenses:read')
  findAllCategories() {
    return this.expensesService.findAllCategories();
  }

  @Get(':id')
  @RequirePermissions('expenses:read')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @RequirePermissions('expenses:create')
  create(@Body() data: any) {
    return this.expensesService.create(data);
  }

  @Patch(':id')
  @RequirePermissions('expenses:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.expensesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('expenses:delete')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }

  @Post('categories')
  @RequirePermissions('expenses:create')
  createCategory(@Body() data: any) {
    return this.expensesService.createCategory(data);
  }

  @Patch('categories/:id')
  @RequirePermissions('expenses:update')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.expensesService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @RequirePermissions('expenses:delete')
  deleteCategory(@Param('id') id: string) {
    return this.expensesService.deleteCategory(id);
  }
}
