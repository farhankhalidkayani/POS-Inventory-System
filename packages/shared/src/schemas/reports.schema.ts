import { z } from "zod";

export const salesSummaryDayResponseSchema = z.object({
  date: z.string(),
  revenueCents: z.number(),
  saleCount: z.number(),
});
export type SalesSummaryDayResponse = z.infer<typeof salesSummaryDayResponseSchema>;

export const salesSummaryResponseSchema = z.object({
  totalRevenueCents: z.number(),
  saleCount: z.number(),
  byDay: z.array(salesSummaryDayResponseSchema),
});
export type SalesSummaryResponse = z.infer<typeof salesSummaryResponseSchema>;

export const topProductResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantitySold: z.number(),
  revenueCents: z.number(),
});
export type TopProductResponse = z.infer<typeof topProductResponseSchema>;
