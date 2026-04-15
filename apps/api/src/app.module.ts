import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SalesModule } from './sales/sales.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { PurchasesModule } from './purchases/purchases.module.js';
import { CashierModule } from './cashier/cashier.module';
import { CashRegistersModule } from './cash-registers/cash-registers.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    SalesModule,
    ReportsModule,
    CustomersModule,
    SuppliersModule,
    PurchasesModule,
    CashierModule,
    CashRegistersModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
