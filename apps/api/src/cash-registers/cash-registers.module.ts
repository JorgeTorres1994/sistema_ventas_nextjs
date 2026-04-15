import { Module } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service.js';
import { CashRegistersController } from './cash-registers.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [CashRegistersService],
  controllers: [CashRegistersController],
  exports: [CashRegistersService]
})
export class CashRegistersModule {}
