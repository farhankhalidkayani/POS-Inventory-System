import { z } from "zod";

export const createSupplierRequestSchema = z.object({
  name: z.string().min(1).max(200),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
});
export type CreateSupplierRequest = z.infer<typeof createSupplierRequestSchema>;

export const supplierResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
});
export type SupplierResponse = z.infer<typeof supplierResponseSchema>;
