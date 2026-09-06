import type { InventoryItemResponse, SalesSummaryResponse, TopProductResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const reportsApi = {
  getSalesSummary(accessToken: string, storeId: string, days: number): Promise<SalesSummaryResponse> {
    return apiFetch<SalesSummaryResponse>(`/api/stores/${storeId}/reports/sales-summary?days=${days}`, { accessToken });
  },

  getTopProducts(accessToken: string, storeId: string, days: number, limit: number): Promise<TopProductResponse[]> {
    return apiFetch<TopProductResponse[]>(
      `/api/stores/${storeId}/reports/top-products?days=${days}&limit=${limit}`,
      { accessToken }
    );
  },

  getLowStock(accessToken: string, storeId: string): Promise<InventoryItemResponse[]> {
    return apiFetch<InventoryItemResponse[]>(`/api/stores/${storeId}/reports/low-stock`, { accessToken });
  },
};
