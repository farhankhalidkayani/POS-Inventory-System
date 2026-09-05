export const STOCK_MOVEMENT_TYPES = ["RECEIVE", "SALE", "ADJUSTMENT"] as const;

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];
