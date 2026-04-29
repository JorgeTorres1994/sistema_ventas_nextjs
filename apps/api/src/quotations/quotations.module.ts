import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service.js';
import { QuotationsController } from './quotations.controller.js';
import { PrismaModule } from '../prisma.module.js';
import { SalesModule } from '../sales/sales.module.js';

@Module({
  imports: [PrismaModule, SalesModule],
  controllers: [QuotationsController],
  providers: [QuotationsService],
})
export class QuotationsModule {}
