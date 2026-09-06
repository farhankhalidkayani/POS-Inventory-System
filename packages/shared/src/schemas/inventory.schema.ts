import { z } from "zod";
import { STOCK_MOVEMENT_TYPES } from "../enums/stockMovementType.js";
import { productResponseSchema } from "./catalog.schema.js";

export const inventoryItemResponseSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  product: productResponseSchema,
  quantity: z.number(),
  reorderThreshold: z.number(),
  isLowStock: z.boolean(),
});
export type InventoryItemResponse = z.infer<typeof inventoryItemResponseSchema>;

export const adjustStockRequestSchema = z.object({
  productId: z.string(),
  type: z.enum(STOCK_MOVEMENT_TYPES),
  quantityChange: z.number().int().refine((value) => value !== 0, "quantityChange must not be zero"),
  note: z.string().max(500).optional(),
});
export type AdjustStockRequest = z.infer<typeof adjustStockRequestSchema>;

export const stockMovementResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  type: z.enum(STOCK_MOVEMENT_TYPES),
  quantityChange: z.number(),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type StockMovementResponse = z.infer<typeof stockMovementResponseSchema>;

export const adjustStockResponseSchema = z.object({
  quantity: z.number(),
  reorderThreshold: z.number(),
  movement: stockMovementResponseSchema,
});
export type AdjustStockResponse = z.infer<typeof adjustStockResponseSchema>;

export const setReorderThresholdRequestSchema = z.object({
  reorderThreshold: z.number().int().nonnegative(),
});
export type SetReorderThresholdRequest = z.infer<typeof setReorderThresholdRequestSchema>;
