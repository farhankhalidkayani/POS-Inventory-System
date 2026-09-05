import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { ORGANIZATIONS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../entities/Organization.js";
import type { OrganizationsRepository } from "../repositories/organizations.repository.js";

@Injectable()
export class GetCurrentOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository
  ) {}

  async execute(organizationId: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }
    return organization;
  }
}
