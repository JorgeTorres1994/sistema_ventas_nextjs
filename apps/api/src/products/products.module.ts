import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule { }
