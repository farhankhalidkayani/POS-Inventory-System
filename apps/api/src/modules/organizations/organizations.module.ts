import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { ORGANIZATIONS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaOrganizationsRepository } from "./repositories/organizations.repository.prisma.js";
import { GetCurrentOrganizationUseCase } from "./usecases/GetCurrentOrganization.usecase.js";
import { OrganizationsController } from "./organizations.controller.js";

@Module({
  controllers: [OrganizationsController],
  providers: [
    {
      provide: ORGANIZATIONS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrganizationsRepository(prisma),
      inject: [PrismaService],
    },
    GetCurrentOrganizationUseCase,
  ],
  exports: [ORGANIZATIONS_REPOSITORY],
})
export class OrganizationsModule {}
