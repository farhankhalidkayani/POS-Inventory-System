import type { OrganizationStatus } from "@pos/shared";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}
