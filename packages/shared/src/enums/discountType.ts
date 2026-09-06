export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[number];
