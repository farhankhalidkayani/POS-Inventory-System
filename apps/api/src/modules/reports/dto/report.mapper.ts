import type { SalesSummaryResponse, TopProductResponse } from "@pos/shared";
import type { SalesSummary, TopProduct } from "../repositories/reports.repository.js";

export function toSalesSummaryResponse(summary: SalesSummary): SalesSummaryResponse {
  return summary;
}

export function toTopProductResponse(topProduct: TopProduct): TopProductResponse {
  return topProduct;
}
