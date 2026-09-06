import { z } from "zod";
import { ORGANIZATION_STATUSES } from "../enums/organizationStatus.js";

export const listPendingOrganizationsQuerySchema = z.object({
  status: z.enum(ORGANIZATION_STATUSES).optional(),
});
export type ListPendingOrganizationsQuery = z.infer<typeof listPendingOrganizationsQuerySchema>;

export const platformOrganizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(ORGANIZATION_STATUSES),
  ownerName: z.string().nullable(),
  ownerEmail: z.string().nullable(),
  createdAt: z.string(),
  approvedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
});
export type PlatformOrganizationResponse = z.infer<typeof platformOrganizationResponseSchema>;
