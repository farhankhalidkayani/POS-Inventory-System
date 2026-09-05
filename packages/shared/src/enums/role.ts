export const ROLES = ["OWNER", "ADMIN", "MANAGER", "CASHIER"] as const;

export type Role = (typeof ROLES)[number];
