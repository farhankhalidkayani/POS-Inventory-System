import { z } from "zod";
import { PAYMENT_METHODS } from "../enums/paymentMethod.js";

export const createSaleLineItemRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});
export type CreateSaleLineItemRequest = z.infer<typeof createSaleLineItemRequestSchema>;

export const createSaleRequestSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  lineItems: z.array(createSaleLineItemRequestSchema).min(1),
  customerId: z.string().optional(),
  discountCode: z.string().optional(),
});
export type CreateSaleRequest = z.infer<typeof createSaleRequestSchema>;

export const saleLineItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitPriceCents: z.number(),
  lineTotalCents: z.number(),
});
export type SaleLineItemResponse = z.infer<typeof saleLineItemResponseSchema>;

export const saleResponseSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  customerId: z.string().nullable(),
  customerName: z.string().nullable(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentReference: z.string().nullable(),
  subtotalCents: z.number(),
  discountCode: z.string().nullable(),
  discountCents: z.number(),
  totalCents: z.number(),
  createdAt: z.string(),
  lineItems: z.array(saleLineItemResponseSchema),
});
export type SaleResponse = z.infer<typeof saleResponseSchema>;
