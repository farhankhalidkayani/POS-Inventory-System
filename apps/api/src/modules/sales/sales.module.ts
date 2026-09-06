import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { SALES_REPOSITORY, SALES_UNIT_OF_WORK } from "../../shared/di/tokens.js";
import { StoresModule } from "../stores/stores.module.js";
import { CustomersModule } from "../customers/customers.module.js";
import { DiscountsModule } from "../discounts/discounts.module.js";
import { PaymentsModule } from "../payments/payments.module.js";
import { PrismaSalesRepository } from "./repositories/sales.repository.prisma.js";
import { PrismaSalesUnitOfWork } from "./services/SalesUnitOfWork.prisma.js";
import { CreateSaleUseCase } from "./usecases/CreateSale.usecase.js";
import { ListStoreSalesUseCase } from "./usecases/ListStoreSales.usecase.js";
import { SalesController } from "./sales.controller.js";

@Module({
  imports: [StoresModule, CustomersModule, DiscountsModule, PaymentsModule],
  controllers: [SalesController],
  providers: [
    {
      provide: SALES_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaSalesRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: SALES_UNIT_OF_WORK,
      useFactory: (prisma: PrismaService) => new PrismaSalesUnitOfWork(prisma),
      inject: [PrismaService],
    },
    CreateSaleUseCase,
    ListStoreSalesUseCase,
  ],
})
export class SalesModule {}
