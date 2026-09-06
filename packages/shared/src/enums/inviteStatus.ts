export const INVITE_STATUSES = ["PENDING", "ACCEPTED", "REVOKED"] as const;

export type InviteStatus = (typeof INVITE_STATUSES)[number];
