import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { USERS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaUsersRepository } from "./repositories/users.repository.prisma.js";
import { ListOrgUsersUseCase } from "./usecases/ListOrgUsers.usecase.js";
import { UsersController } from "./users.controller.js";

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaUsersRepository(prisma),
      inject: [PrismaService],
    },
    ListOrgUsersUseCase,
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
