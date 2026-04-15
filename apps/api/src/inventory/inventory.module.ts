import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma.service.js';

@Module({
    controllers: [InventoryController],
    providers: [InventoryService],
})
export class InventoryModule {}
