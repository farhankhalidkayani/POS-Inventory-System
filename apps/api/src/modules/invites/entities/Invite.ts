import type { InviteStatus, Role } from "@pos/shared";

export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  token: string;
  status: InviteStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface CreateInviteInput {
  organizationId: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: Date;
}
