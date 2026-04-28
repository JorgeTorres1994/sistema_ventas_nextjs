import { Module } from '@nestjs/common';
import { InvoicingService } from './invoicing.service.js';
import { InvoicingController } from './invoicing.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [InvoicingController],
  providers: [InvoicingService, PrismaService],
  exports: [InvoicingService]
})
export class InvoicingModule {}
