import type { CreateSaleRequest, SaleResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const salesApi = {
  listStoreSales(accessToken: string, storeId: string): Promise<SaleResponse[]> {
    return apiFetch<SaleResponse[]>(`/api/stores/${storeId}/sales`, { accessToken });
  },

  createSale(accessToken: string, storeId: string, input: CreateSaleRequest): Promise<SaleResponse> {
    return apiFetch<SaleResponse>(`/api/stores/${storeId}/sales`, { method: "POST", accessToken, body: input });
  },
};
