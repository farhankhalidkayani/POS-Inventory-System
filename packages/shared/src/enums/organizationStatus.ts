export const ORGANIZATION_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
