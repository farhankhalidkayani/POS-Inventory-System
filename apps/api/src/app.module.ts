import { Module } from "@nestjs/common";
import { ConfigModule } from "./shared/config/config.module.js";
import { PrismaModule } from "./shared/prisma/prisma.module.js";
import { SecurityModule } from "./shared/security/security.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { OrganizationsModule } from "./modules/organizations/organizations.module.js";
import { StoresModule } from "./modules/stores/stores.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { InventoryModule } from "./modules/inventory/inventory.module.js";
import { SalesModule } from "./modules/sales/sales.module.js";
import { ReportsModule } from "./modules/reports/reports.module.js";
import { SuppliersModule } from "./modules/suppliers/suppliers.module.js";
import { PurchaseOrdersModule } from "./modules/purchase-orders/purchase-orders.module.js";
import { CustomersModule } from "./modules/customers/customers.module.js";
import { DiscountsModule } from "./modules/discounts/discounts.module.js";
import { PaymentsModule } from "./modules/payments/payments.module.js";
import { InvitesModule } from "./modules/invites/invites.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SecurityModule,
    UsersModule,
    OrganizationsModule,
    StoresModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    ReportsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    CustomersModule,
    DiscountsModule,
    PaymentsModule,
    InvitesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
