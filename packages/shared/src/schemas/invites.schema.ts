import { z } from "zod";
import { ROLES } from "../enums/role.js";
import { INVITE_STATUSES } from "../enums/inviteStatus.js";

export const createInviteRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
});
export type CreateInviteRequest = z.infer<typeof createInviteRequestSchema>;

export const inviteResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(ROLES),
  status: z.enum(INVITE_STATUSES),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type InviteResponse = z.infer<typeof inviteResponseSchema>;

export const acceptInviteRequestSchema = z.object({
  token: z.string(),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  password: z.string().min(8).max(128),
});
export type AcceptInviteRequest = z.infer<typeof acceptInviteRequestSchema>;

export const inviteDetailsResponseSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
  organizationName: z.string(),
});
export type InviteDetailsResponse = z.infer<typeof inviteDetailsResponseSchema>;
