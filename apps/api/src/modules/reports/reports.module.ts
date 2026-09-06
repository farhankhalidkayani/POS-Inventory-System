import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { REPORTS_REPOSITORY } from "../../shared/di/tokens.js";
import { StoresModule } from "../stores/stores.module.js";
import { InventoryModule } from "../inventory/inventory.module.js";
import { PrismaReportsRepository } from "./repositories/reports.repository.prisma.js";
import { GetSalesSummaryUseCase } from "./usecases/GetSalesSummary.usecase.js";
import { GetTopProductsUseCase } from "./usecases/GetTopProducts.usecase.js";
import { GetLowStockItemsUseCase } from "./usecases/GetLowStockItems.usecase.js";
import { ReportsController } from "./reports.controller.js";

@Module({
  imports: [StoresModule, InventoryModule],
  controllers: [ReportsController],
  providers: [
    {
      provide: REPORTS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaReportsRepository(prisma),
      inject: [PrismaService],
    },
    GetSalesSummaryUseCase,
    GetTopProductsUseCase,
    GetLowStockItemsUseCase,
  ],
})
export class ReportsModule {}
