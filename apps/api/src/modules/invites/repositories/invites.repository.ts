import type { InviteStatus } from "@pos/shared";
import type { CreateInviteInput, Invite } from "../entities/Invite.js";

export interface InvitesRepository {
  create(input: CreateInviteInput): Promise<Invite>;
  findByToken(token: string): Promise<Invite | null>;
  findPendingByEmail(organizationId: string, email: string): Promise<Invite | null>;
  findById(organizationId: string, id: string): Promise<Invite | null>;
  listByOrganization(organizationId: string): Promise<Invite[]>;
  updateStatus(id: string, status: InviteStatus, acceptedAt?: Date): Promise<Invite>;
}
