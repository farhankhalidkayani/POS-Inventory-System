import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { INVENTORY_REPOSITORY, INVENTORY_UNIT_OF_WORK } from "../../shared/di/tokens.js";
import { ProductsModule } from "../products/products.module.js";
import { StoresModule } from "../stores/stores.module.js";
import { PrismaInventoryRepository } from "./repositories/inventory.repository.prisma.js";
import { PrismaInventoryUnitOfWork } from "./services/InventoryUnitOfWork.prisma.js";
import { GetStoreInventoryUseCase } from "./usecases/GetStoreInventory.usecase.js";
import { AdjustStockUseCase } from "./usecases/AdjustStock.usecase.js";
import { InventoryController } from "./inventory.controller.js";

@Module({
  imports: [ProductsModule, StoresModule],
  controllers: [InventoryController],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaInventoryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: INVENTORY_UNIT_OF_WORK,
      useFactory: (prisma: PrismaService) => new PrismaInventoryUnitOfWork(prisma),
      inject: [PrismaService],
    },
    GetStoreInventoryUseCase,
    AdjustStockUseCase,
  ],
})
export class InventoryModule {}
