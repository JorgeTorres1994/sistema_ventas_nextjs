import { Module } from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaModule } from '../prisma.module.js';
import { CashRegistersModule } from '../cash-registers/cash-registers.module.js';
import { PromotionsModule } from '../promotions/promotions.module.js';

@Module({
    imports: [PrismaModule, CashRegistersModule, PromotionsModule],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
