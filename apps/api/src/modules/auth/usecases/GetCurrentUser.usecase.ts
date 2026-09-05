import { NotFoundError } from "../../../shared/errors/AppError.js";
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

export class GetCurrentUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly storesRepository: StoresRepository
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
