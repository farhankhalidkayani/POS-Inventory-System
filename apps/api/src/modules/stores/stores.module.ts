import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { STORES_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaStoresRepository } from "./repositories/stores.repository.prisma.js";
import { ListStoresForOrganizationUseCase } from "./usecases/ListStoresForOrganization.usecase.js";
import { StoresController } from "./stores.controller.js";

@Module({
  controllers: [StoresController],
  providers: [
    {
      provide: STORES_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaStoresRepository(prisma),
      inject: [PrismaService],
    },
    ListStoresForOrganizationUseCase,
  ],
  exports: [STORES_REPOSITORY],
})
export class StoresModule {}
