import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) {}

    @Post()
    create(@Body() createSupplierDto: {
        name: string;
        dniRuc: string;
        email?: string;
        phone?: string;
        address?: string;
    }) {
        return this.suppliersService.create(createSupplierDto);
    }

    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.suppliersService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.suppliersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateSupplierDto: {
            name?: string;
            dniRuc?: string;
            email?: string;
            phone?: string;
            address?: string;
            isActive?: boolean;
        },
    ) {
        return this.suppliersService.update(id, updateSupplierDto);
    }

    @Patch(':id/status')
    toggleStatus(@Param('id') id: string) {
        return this.suppliersService.toggleStatus(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        // Soft delete — set isActive to false instead of physical deletion
        return this.suppliersService.update(id, { isActive: false });
    }
}
