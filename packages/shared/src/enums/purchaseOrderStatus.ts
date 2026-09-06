export const PURCHASE_ORDER_STATUSES = ["ORDERED", "RECEIVED", "CANCELLED"] as const;

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];
