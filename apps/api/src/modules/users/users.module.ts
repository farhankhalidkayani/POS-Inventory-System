import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { USERS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaUsersRepository } from "./repositories/users.repository.prisma.js";

@Module({
  providers: [
    {
      provide: USERS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaUsersRepository(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
