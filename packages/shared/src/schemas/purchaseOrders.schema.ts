import { z } from "zod";
import { PURCHASE_ORDER_STATUSES } from "../enums/purchaseOrderStatus.js";

export const createPurchaseOrderLineItemRequestSchema = z.object({
  productId: z.string(),
  quantityOrdered: z.number().int().positive(),
  unitCostCents: z.number().int().nonnegative(),
});
export type CreatePurchaseOrderLineItemRequest = z.infer<typeof createPurchaseOrderLineItemRequestSchema>;

export const createPurchaseOrderRequestSchema = z.object({
  supplierId: z.string(),
  lineItems: z.array(createPurchaseOrderLineItemRequestSchema).min(1),
});
export type CreatePurchaseOrderRequest = z.infer<typeof createPurchaseOrderRequestSchema>;

export const purchaseOrderLineItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantityOrdered: z.number(),
  quantityReceived: z.number(),
  unitCostCents: z.number(),
});
export type PurchaseOrderLineItemResponse = z.infer<typeof purchaseOrderLineItemResponseSchema>;

export const purchaseOrderResponseSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  supplierId: z.string(),
  supplierName: z.string(),
  status: z.enum(PURCHASE_ORDER_STATUSES),
  totalCostCents: z.number(),
  receivedAt: z.string().nullable(),
  createdAt: z.string(),
  lineItems: z.array(purchaseOrderLineItemResponseSchema),
});
export type PurchaseOrderResponse = z.infer<typeof purchaseOrderResponseSchema>;
