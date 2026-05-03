import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Request } from 'express';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    userId: string | null,
    module: string,
    action: string,
    description: string,
    details?: any,
    req?: Request
  ) {
    try {
      const ipAddress = req?.ip || req?.headers['x-forwarded-for']?.toString() || null;
      const userAgent = req?.headers['user-agent'] || null;

      await (this.prisma as any).auditLog.create({
        data: {
          userId,
          module,
          action,
          description,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          ipAddress,
          userAgent
        }
      });
    } catch (error) {
      console.error('Error recording audit log:', error);
    }
  }

  async getLogs(filters: {
    module?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    if (filters.module) where.module = filters.module;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      (this.prisma as any).auditLog.count({ where })
    ]);

    return { data, total };
  }

  async getNotifications() {
    return (this.prisma as any).auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });
  }

  async markAllAsRead() {
    return (this.prisma as any).auditLog.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
  }
}
