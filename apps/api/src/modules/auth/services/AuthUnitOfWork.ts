import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";

export interface AuthUnitOfWorkRepositories {
  organizations: OrganizationsRepository;
  stores: StoresRepository;
  users: UsersRepository;
}

export interface AuthUnitOfWork {
  runInTransaction<T>(work: (repositories: AuthUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
