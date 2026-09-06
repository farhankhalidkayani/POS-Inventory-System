import type { PrismaClient } from "../../../shared/db/prisma.js";
import { PrismaUsersRepository } from "../../users/repositories/users.repository.prisma.js";
import { PrismaInvitesRepository } from "../repositories/invites.repository.prisma.js";
import type { InvitesUnitOfWork, InvitesUnitOfWorkRepositories } from "./InvitesUnitOfWork.js";

export class PrismaInvitesUnitOfWork implements InvitesUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async runInTransaction<T>(work: (repositories: InvitesUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        users: new PrismaUsersRepository(tx),
        invites: new PrismaInvitesRepository(tx),
      })
    );
  }
}
