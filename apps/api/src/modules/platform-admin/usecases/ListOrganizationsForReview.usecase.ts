import { Inject, Injectable } from "@nestjs/common";
import type { OrganizationStatus } from "@pos/shared";
import { ORGANIZATIONS_REPOSITORY, USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { User } from "../../users/entities/User.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";

export interface OrganizationForReview {
  organization: Organization;
  owner: User | null;
}

@Injectable()
export class ListOrganizationsForReviewUseCase {
  constructor(
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository,
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository
  ) {}

  async execute(status?: OrganizationStatus): Promise<OrganizationForReview[]> {
    const organizations = status
      ? await this.organizationsRepository.listByStatus(status)
      : await this.organizationsRepository.listAll();

    return Promise.all(
      organizations.map(async (organization) => {
        const members = await this.usersRepository.listByOrganization(organization.id);
        const owner = members.find((member) => member.role === "OWNER") ?? members[0] ?? null;
        return { organization, owner };
      })
    );
  }
}
