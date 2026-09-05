import type { ProductWithCategory } from "../../products/entities/Product.js";

export interface InventoryItem {
  id: string;
  organizationId: string;
  storeId: string;
  productId: string;
  quantity: number;
  reorderThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemWithProduct extends InventoryItem {
  product: ProductWithCategory;
}
