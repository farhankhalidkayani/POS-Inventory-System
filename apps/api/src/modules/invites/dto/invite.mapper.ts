import type { InviteResponse } from "@pos/shared";
import type { Invite } from "../entities/Invite.js";

export function toInviteResponse(invite: Invite): InviteResponse {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    token: invite.token,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
  };
}
