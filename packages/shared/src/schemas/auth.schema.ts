import { z } from "zod";
import { ROLES } from "../enums/role.js";

export const registerOrganizationRequestSchema = z.object({
  organizationName: z.string().min(2).max(120),
  storeName: z.string().min(2).max(120),
  ownerFirstName: z.string().min(1).max(60),
  ownerLastName: z.string().min(1).max(60),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8).max(128),
});
export type RegisterOrganizationRequest = z.infer<typeof registerOrganizationRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const authUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(ROLES),
  organizationId: z.string(),
});
export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

export const organizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;

export const storeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().nullable(),
});
export type StoreResponse = z.infer<typeof storeResponseSchema>;

export const authSessionResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserResponseSchema,
  organization: organizationResponseSchema,
  store: storeResponseSchema,
});
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;

export const currentUserResponseSchema = z.object({
  user: authUserResponseSchema,
  organization: organizationResponseSchema,
  store: storeResponseSchema.nullable(),
});
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
