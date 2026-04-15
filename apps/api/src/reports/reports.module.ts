import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
    controllers: [ReportsController],
    providers: [ReportsService, PrismaService],
})
export class ReportsModule { }
