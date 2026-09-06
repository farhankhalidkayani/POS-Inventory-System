import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { User } from "../entities/User.js";
import type { UsersRepository } from "../repositories/users.repository.js";

@Injectable()
export class ListOrgUsersUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  async execute(organizationId: string): Promise<User[]> {
    return this.usersRepository.listByOrganization(organizationId);
  }
}
