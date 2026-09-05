import type { StockMovementType } from "@pos/shared";

export interface StockMovement {
  id: string;
  organizationId: string;
  storeId: string;
  productId: string;
  type: StockMovementType;
  quantityChange: number;
  note: string | null;
  createdAt: Date;
}

export interface CreateStockMovementInput {
  organizationId: string;
  storeId: string;
  productId: string;
  type: StockMovementType;
  quantityChange: number;
  note?: string | null;
}
