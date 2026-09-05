import type { InventoryItem, InventoryItemWithProduct } from "../entities/InventoryItem.js";

export interface InventoryRepository {
  findByStoreAndProduct(organizationId: string, storeId: string, productId: string): Promise<InventoryItem | null>;
  setQuantity(organizationId: string, storeId: string, productId: string, quantity: number): Promise<InventoryItem>;
  listByStore(organizationId: string, storeId: string): Promise<InventoryItemWithProduct[]>;
}
