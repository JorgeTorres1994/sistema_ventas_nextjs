import { Module } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
    controllers: [SalesController],
    providers: [SalesService, PrismaService],
    exports: [SalesService],
})
export class SalesModule { }
