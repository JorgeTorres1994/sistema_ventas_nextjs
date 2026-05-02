import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  async getLogs(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.auditService.getLogs({
      module,
      action,
      userId,
      startDate,
      endDate,
      search,
    });
  }

  @Get('notifications')
  @RequirePermissions('audit:read')
  async getNotifications() {
    return this.auditService.getNotifications();
  }

  @Post('mark-read')
  @RequirePermissions('audit:update')
  async markAllAsRead() {
    return this.auditService.markAllAsRead();
  }
}
