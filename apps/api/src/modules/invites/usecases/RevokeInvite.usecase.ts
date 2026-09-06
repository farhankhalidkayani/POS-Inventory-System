import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { INVITES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Invite } from "../entities/Invite.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";

@Injectable()
export class RevokeInviteUseCase {
  constructor(@Inject(INVITES_REPOSITORY) private readonly invitesRepository: InvitesRepository) {}

  async execute(organizationId: string, inviteId: string): Promise<Invite> {
    const invite = await this.invitesRepository.findById(organizationId, inviteId);
    if (!invite) {
      throw new NotFoundError("Invite not found");
    }
    if (invite.status !== "PENDING") {
      throw new ValidationError("Only pending invites can be revoked");
    }

    return this.invitesRepository.updateStatus(invite.id, "REVOKED");
  }
}
