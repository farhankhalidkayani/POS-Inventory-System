import { z } from "zod";
import { DISCOUNT_TYPES } from "../enums/discountType.js";

export const createDiscountRequestSchema = z.object({
  code: z.string().min(1).max(40),
  type: z.enum(DISCOUNT_TYPES),
  value: z.number().int().positive(),
});
export type CreateDiscountRequest = z.infer<typeof createDiscountRequestSchema>;

export const discountResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(DISCOUNT_TYPES),
  value: z.number(),
  active: z.boolean(),
});
export type DiscountResponse = z.infer<typeof discountResponseSchema>;
