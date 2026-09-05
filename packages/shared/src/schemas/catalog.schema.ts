import { z } from "zod";

export const createCategoryRequestSchema = z.object({
  name: z.string().min(1).max(120),
});
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;

export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

export const createProductRequestSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  barcode: z.string().max(64).optional(),
  priceCents: z.number().int().nonnegative(),
  categoryId: z.string().optional(),
});
export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;

export const updateProductRequestSchema = z.object({
  sku: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  barcode: z.string().max(64).nullable().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  categoryId: z.string().nullable().optional(),
});
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;

export const productResponseSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  barcode: z.string().nullable(),
  priceCents: z.number(),
  category: categoryResponseSchema.nullable(),
});
export type ProductResponse = z.infer<typeof productResponseSchema>;
