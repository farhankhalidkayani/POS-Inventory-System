import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { AUTH_UNIT_OF_WORK } from "../../shared/di/tokens.js";
import { OrganizationsModule } from "../organizations/organizations.module.js";
import { StoresModule } from "../stores/stores.module.js";
import { UsersModule } from "../users/users.module.js";
import { PrismaAuthUnitOfWork } from "./services/AuthUnitOfWork.prisma.js";
import { PasswordService } from "./services/PasswordService.js";
import { RegisterOrganizationOwnerUseCase } from "./usecases/RegisterOrganizationOwner.usecase.js";
import { LoginUserUseCase } from "./usecases/LoginUser.usecase.js";
import { RefreshTokenUseCase } from "./usecases/RefreshToken.usecase.js";
import { GetCurrentUserUseCase } from "./usecases/GetCurrentUser.usecase.js";
import { AuthController } from "./auth.controller.js";

@Module({
  imports: [OrganizationsModule, StoresModule, UsersModule],
  controllers: [AuthController],
  providers: [
    PasswordService,
    {
      provide: AUTH_UNIT_OF_WORK,
      useFactory: (prisma: PrismaService) => new PrismaAuthUnitOfWork(prisma),
      inject: [PrismaService],
    },
    RegisterOrganizationOwnerUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    GetCurrentUserUseCase,
  ],
})
export class AuthModule {}
