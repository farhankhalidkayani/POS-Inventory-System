import type { Env } from "../shared/config/env.js";
import { createPrismaClient, type PrismaClient } from "../shared/db/prisma.js";
import { createAuthenticateMiddleware } from "../shared/middleware/authenticate.js";

import { PrismaOrganizationsRepository } from "../modules/organizations/repositories/organizations.repository.prisma.js";
import { GetCurrentOrganizationUseCase } from "../modules/organizations/usecases/GetCurrentOrganization.usecase.js";
import { OrganizationsController } from "../modules/organizations/organizations.controller.js";

import { PrismaStoresRepository } from "../modules/stores/repositories/stores.repository.prisma.js";
import { ListStoresForOrganizationUseCase } from "../modules/stores/usecases/ListStoresForOrganization.usecase.js";
import { StoresController } from "../modules/stores/stores.controller.js";

import { PrismaUsersRepository } from "../modules/users/repositories/users.repository.prisma.js";

import { PasswordService } from "../modules/auth/services/PasswordService.js";
import { TokenService } from "../modules/auth/services/TokenService.js";
import { PrismaAuthUnitOfWork } from "../modules/auth/services/AuthUnitOfWork.prisma.js";
import { RegisterOrganizationOwnerUseCase } from "../modules/auth/usecases/RegisterOrganizationOwner.usecase.js";
import { LoginUserUseCase } from "../modules/auth/usecases/LoginUser.usecase.js";
import { RefreshTokenUseCase } from "../modules/auth/usecases/RefreshToken.usecase.js";
import { GetCurrentUserUseCase } from "../modules/auth/usecases/GetCurrentUser.usecase.js";
import { AuthController } from "../modules/auth/auth.controller.js";

export interface Container {
  prisma: PrismaClient;
  authenticate: ReturnType<typeof createAuthenticateMiddleware>;
  authController: AuthController;
  organizationsController: OrganizationsController;
  storesController: StoresController;
}

export function buildContainer(env: Env): Container {
  const prisma = createPrismaClient();

  const organizationsRepository = new PrismaOrganizationsRepository(prisma);
  const storesRepository = new PrismaStoresRepository(prisma);
  const usersRepository = new PrismaUsersRepository(prisma);

  const passwordService = new PasswordService();
  const tokenService = new TokenService({
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  const authUnitOfWork = new PrismaAuthUnitOfWork(prisma);

  const authController = new AuthController(
    new RegisterOrganizationOwnerUseCase(authUnitOfWork, passwordService, tokenService),
    new LoginUserUseCase(usersRepository, organizationsRepository, storesRepository, passwordService, tokenService),
    new RefreshTokenUseCase(usersRepository, tokenService),
    new GetCurrentUserUseCase(usersRepository, organizationsRepository, storesRepository)
  );

  const organizationsController = new OrganizationsController(
    new GetCurrentOrganizationUseCase(organizationsRepository)
  );

  const storesController = new StoresController(new ListStoresForOrganizationUseCase(storesRepository));

  const authenticate = createAuthenticateMiddleware(tokenService);

  return { prisma, authenticate, authController, organizationsController, storesController };
}
