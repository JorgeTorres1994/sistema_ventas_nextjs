import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { DocumentSeriesService } from './document-series.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('document-series')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentSeriesController {
    constructor(private readonly seriesService: DocumentSeriesService) { }

    @Get()
    @RequirePermissions('settings:read')
    findAll() {
        return this.seriesService.findAll();
    }

    @Post()
    @RequirePermissions('settings:update')
    create(@Body() data: any) {
        return this.seriesService.create(data);
    }

    @Patch(':id')
    @RequirePermissions('settings:update')
    update(@Param('id') id: string, @Body() data: any) {
        return this.seriesService.update(id, data);
    }
}
