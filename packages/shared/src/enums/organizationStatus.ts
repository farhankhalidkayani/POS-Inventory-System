export const ORGANIZATION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
