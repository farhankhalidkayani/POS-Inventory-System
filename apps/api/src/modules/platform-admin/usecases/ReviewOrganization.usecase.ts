import { Inject, Injectable } from "@nestjs/common";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";
import { ORGANIZATIONS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";

@Injectable()
export class ReviewOrganizationUseCase {
  constructor(@Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository) {}

  /** Approves a pending or rejected signup, or reactivates a suspended organization. */
  async approve(organizationId: string): Promise<Organization> {
    const organization = await this.findOrThrow(organizationId);
    if (organization.status === "APPROVED") {
      throw new ConflictError("This organization is already approved");
    }
    return this.organizationsRepository.updateStatus(organizationId, "APPROVED");
  }

  async reject(organizationId: string): Promise<Organization> {
    const organization = await this.findOrThrow(organizationId);
    if (organization.status !== "PENDING") {
      throw new ConflictError("Only a pending organization can be rejected");
    }
    return this.organizationsRepository.updateStatus(organizationId, "REJECTED");
  }

  /** Pauses an approved organization's access, e.g. for a billing issue. */
  async suspend(organizationId: string): Promise<Organization> {
    const organization = await this.findOrThrow(organizationId);
    if (organization.status !== "APPROVED") {
      throw new ConflictError("Only an approved organization can be suspended");
    }
    return this.organizationsRepository.updateStatus(organizationId, "SUSPENDED");
  }

  private async findOrThrow(organizationId: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }
    return organization;
  }
}
