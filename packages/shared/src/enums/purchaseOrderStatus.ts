export const PURCHASE_ORDER_STATUSES = ["ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as const;

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];
