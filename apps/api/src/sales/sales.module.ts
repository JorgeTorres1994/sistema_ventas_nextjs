import { Module } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';
import { PrismaService } from '../prisma.service.js';
import { CashRegistersModule } from '../cash-registers/cash-registers.module.js';

@Module({
    imports: [CashRegistersModule],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
