import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { PURCHASE_ORDERS_REPOSITORY, PURCHASE_ORDERS_UNIT_OF_WORK } from "../../shared/di/tokens.js";
import { StoresModule } from "../stores/stores.module.js";
import { SuppliersModule } from "../suppliers/suppliers.module.js";
import { ProductsModule } from "../products/products.module.js";
import { InventoryModule } from "../inventory/inventory.module.js";
import { PrismaPurchaseOrdersRepository } from "./repositories/purchaseOrders.repository.prisma.js";
import { PrismaPurchaseOrdersUnitOfWork } from "./services/PurchaseOrdersUnitOfWork.prisma.js";
import { CreatePurchaseOrderUseCase } from "./usecases/CreatePurchaseOrder.usecase.js";
import { ListStorePurchaseOrdersUseCase } from "./usecases/ListStorePurchaseOrders.usecase.js";
import { ReceivePurchaseOrderUseCase } from "./usecases/ReceivePurchaseOrder.usecase.js";
import { CancelPurchaseOrderUseCase } from "./usecases/CancelPurchaseOrder.usecase.js";
import { PurchaseOrdersController } from "./purchase-orders.controller.js";

@Module({
  imports: [StoresModule, SuppliersModule, ProductsModule, InventoryModule],
  controllers: [PurchaseOrdersController],
  providers: [
    {
      provide: PURCHASE_ORDERS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPurchaseOrdersRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PURCHASE_ORDERS_UNIT_OF_WORK,
      useFactory: (prisma: PrismaService) => new PrismaPurchaseOrdersUnitOfWork(prisma),
      inject: [PrismaService],
    },
    CreatePurchaseOrderUseCase,
    ListStorePurchaseOrdersUseCase,
    ReceivePurchaseOrderUseCase,
    CancelPurchaseOrderUseCase,
  ],
})
export class PurchaseOrdersModule {}
