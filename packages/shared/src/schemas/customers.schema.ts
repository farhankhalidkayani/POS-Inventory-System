import { z } from "zod";

export const createCustomerRequestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
});
export type CreateCustomerRequest = z.infer<typeof createCustomerRequestSchema>;

export const customerResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
