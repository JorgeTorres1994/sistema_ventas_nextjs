import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    create(@Body() createCustomerDto: {
        name: string;
        dni: string;
        email?: string;
        phone?: string;
        address?: string;
    }) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.customersService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateCustomerDto: {
            name?: string;
            dni?: string;
            email?: string;
            phone?: string;
            address?: string;
            isActive?: boolean;
        },
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Patch(':id/status')
    toggleStatus(@Param('id') id: string) {
        return this.customersService.toggleStatus(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        // Soft delete — set isActive to false instead of physical deletion
        return this.customersService.update(id, { isActive: false });
    }
}
