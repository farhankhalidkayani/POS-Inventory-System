import type { UsersRepository } from "../../users/repositories/users.repository.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";

export interface InvitesUnitOfWorkRepositories {
  users: UsersRepository;
  invites: InvitesRepository;
}

export interface InvitesUnitOfWork {
  runInTransaction<T>(work: (repositories: InvitesUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
