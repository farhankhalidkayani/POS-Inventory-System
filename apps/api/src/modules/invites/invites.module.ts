import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { INVITES_REPOSITORY, INVITES_UNIT_OF_WORK } from "../../shared/di/tokens.js";
import { OrganizationsModule } from "../organizations/organizations.module.js";
import { StoresModule } from "../stores/stores.module.js";
import { UsersModule } from "../users/users.module.js";
import { PasswordService } from "../auth/services/PasswordService.js";
import { PrismaInvitesRepository } from "./repositories/invites.repository.prisma.js";
import { PrismaInvitesUnitOfWork } from "./services/InvitesUnitOfWork.prisma.js";
import { CreateInviteUseCase } from "./usecases/CreateInvite.usecase.js";
import { ListInvitesUseCase } from "./usecases/ListInvites.usecase.js";
import { RevokeInviteUseCase } from "./usecases/RevokeInvite.usecase.js";
import { GetInviteDetailsUseCase } from "./usecases/GetInviteDetails.usecase.js";
import { AcceptInviteUseCase } from "./usecases/AcceptInvite.usecase.js";
import { InvitesController } from "./invites.controller.js";

@Module({
  imports: [OrganizationsModule, StoresModule, UsersModule],
  controllers: [InvitesController],
  providers: [
    PasswordService,
    {
      provide: INVITES_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaInvitesRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: INVITES_UNIT_OF_WORK,
      useFactory: (prisma: PrismaService) => new PrismaInvitesUnitOfWork(prisma),
      inject: [PrismaService],
    },
    CreateInviteUseCase,
    ListInvitesUseCase,
    RevokeInviteUseCase,
    GetInviteDetailsUseCase,
    AcceptInviteUseCase,
  ],
})
export class InvitesModule {}
