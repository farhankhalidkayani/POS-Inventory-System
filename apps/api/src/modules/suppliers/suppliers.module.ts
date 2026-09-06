import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { SUPPLIERS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaSuppliersRepository } from "./repositories/suppliers.repository.prisma.js";
import { CreateSupplierUseCase } from "./usecases/CreateSupplier.usecase.js";
import { ListSuppliersUseCase } from "./usecases/ListSuppliers.usecase.js";
import { SuppliersController } from "./suppliers.controller.js";

@Module({
  controllers: [SuppliersController],
  providers: [
    {
      provide: SUPPLIERS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaSuppliersRepository(prisma),
      inject: [PrismaService],
    },
    CreateSupplierUseCase,
    ListSuppliersUseCase,
  ],
  exports: [SUPPLIERS_REPOSITORY],
})
export class SuppliersModule {}
