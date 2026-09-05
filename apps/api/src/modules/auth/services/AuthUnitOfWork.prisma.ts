import type { PrismaClient } from "../../../shared/db/prisma.js";
import { PrismaOrganizationsRepository } from "../../organizations/repositories/organizations.repository.prisma.js";
import { PrismaStoresRepository } from "../../stores/repositories/stores.repository.prisma.js";
import { PrismaUsersRepository } from "../../users/repositories/users.repository.prisma.js";
import type { AuthUnitOfWork, AuthUnitOfWorkRepositories } from "./AuthUnitOfWork.js";

export class PrismaAuthUnitOfWork implements AuthUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async runInTransaction<T>(work: (repositories: AuthUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        organizations: new PrismaOrganizationsRepository(tx),
        stores: new PrismaStoresRepository(tx),
        users: new PrismaUsersRepository(tx),
      })
    );
  }
}
