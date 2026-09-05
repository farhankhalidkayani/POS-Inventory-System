import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { ORGANIZATIONS_REPOSITORY, STORES_REPOSITORY, USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { Store } from "../../stores/entities/Store.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { User } from "../../users/entities/User.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";

export interface GetCurrentUserResult {
  user: User;
  organization: Organization;
  store: Store | null;
}

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, userId: string): Promise<GetCurrentUserResult> {
    const user = await this.usersRepository.findById(organizationId, userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    const store = await this.storesRepository.findFirstByOrganization(organizationId);

    return { user, organization, store };
  }
}
