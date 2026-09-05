import { NotFoundError } from "../../../shared/errors/AppError.js";
import type { Organization } from "../entities/Organization.js";
import type { OrganizationsRepository } from "../repositories/organizations.repository.js";

export class GetCurrentOrganizationUseCase {
  constructor(private readonly organizationsRepository: OrganizationsRepository) {}

  async execute(organizationId: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }
    return organization;
  }
}
