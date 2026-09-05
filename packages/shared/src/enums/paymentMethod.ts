export const PAYMENT_METHODS = ["CASH", "CARD"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
