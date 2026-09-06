import { Inject, Injectable } from "@nestjs/common";
import { INVITES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Invite } from "../entities/Invite.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";

@Injectable()
export class ListInvitesUseCase {
  constructor(@Inject(INVITES_REPOSITORY) private readonly invitesRepository: InvitesRepository) {}

  async execute(organizationId: string): Promise<Invite[]> {
    return this.invitesRepository.listByOrganization(organizationId);
  }
}
