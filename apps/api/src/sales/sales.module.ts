import { SalesController } from './sales.controller.js';
import { PrismaModule } from '../prisma.module.js';
import { CashRegistersModule } from '../cash-registers/cash-registers.module.js';

@Module({
    imports: [PrismaModule, CashRegistersModule],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
