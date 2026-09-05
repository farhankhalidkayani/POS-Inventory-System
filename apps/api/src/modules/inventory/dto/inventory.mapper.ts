import type { AdjustStockResponse, InventoryItemResponse, StockMovementResponse } from "@pos/shared";
import { toProductResponse } from "../../products/dto/product.mapper.js";
import type { InventoryItem, InventoryItemWithProduct } from "../entities/InventoryItem.js";
import type { StockMovement } from "../entities/StockMovement.js";

export function toInventoryItemResponse(item: InventoryItemWithProduct): InventoryItemResponse {
  return {
    id: item.id,
    storeId: item.storeId,
    product: toProductResponse(item.product),
    quantity: item.quantity,
    reorderThreshold: item.reorderThreshold,
    isLowStock: item.quantity <= item.reorderThreshold,
  };
}

export function toStockMovementResponse(movement: StockMovement): StockMovementResponse {
  return {
    id: movement.id,
    productId: movement.productId,
    type: movement.type,
    quantityChange: movement.quantityChange,
    note: movement.note,
    createdAt: movement.createdAt.toISOString(),
  };
}

export function toAdjustStockResponse(inventoryItem: InventoryItem, movement: StockMovement): AdjustStockResponse {
  return {
    quantity: inventoryItem.quantity,
    reorderThreshold: inventoryItem.reorderThreshold,
    movement: toStockMovementResponse(movement),
  };
}
