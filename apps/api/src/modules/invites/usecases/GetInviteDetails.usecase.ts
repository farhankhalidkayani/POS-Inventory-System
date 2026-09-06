import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { INVITES_REPOSITORY, ORGANIZATIONS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";

export interface InviteDetails {
  email: string;
  role: string;
  organizationName: string;
}

@Injectable()
export class GetInviteDetailsUseCase {
  constructor(
    @Inject(INVITES_REPOSITORY) private readonly invitesRepository: InvitesRepository,
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository
  ) {}

  async execute(token: string): Promise<InviteDetails> {
    const invite = await this.invitesRepository.findByToken(token);
    if (!invite) {
      throw new NotFoundError("Invite not found");
    }
    if (invite.status !== "PENDING") {
      throw new ValidationError("This invite is no longer valid");
    }
    if (invite.expiresAt < new Date()) {
      throw new ValidationError("This invite has expired");
    }

    const organization = await this.organizationsRepository.findById(invite.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    return { email: invite.email, role: invite.role, organizationName: organization.name };
  }
}
