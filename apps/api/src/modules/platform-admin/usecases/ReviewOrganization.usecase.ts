import { Inject, Injectable } from "@nestjs/common";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";
import { ORGANIZATIONS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";

@Injectable()
export class ReviewOrganizationUseCase {
  constructor(@Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository) {}

  async approve(organizationId: string): Promise<Organization> {
    return this.transition(organizationId, "APPROVED");
  }

  async reject(organizationId: string): Promise<Organization> {
    return this.transition(organizationId, "REJECTED");
  }

  private async transition(organizationId: string, target: "APPROVED" | "REJECTED"): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }
    if (organization.status !== "PENDING") {
      throw new ConflictError(`This organization has already been ${organization.status.toLowerCase()}`);
    }

    return this.organizationsRepository.updateStatus(organizationId, target);
  }
}
