import type { AdjustStockRequest, AdjustStockResponse, InventoryItemResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const inventoryApi = {
  listStoreInventory(accessToken: string, storeId: string): Promise<InventoryItemResponse[]> {
    return apiFetch<InventoryItemResponse[]>(`/api/stores/${storeId}/inventory`, { accessToken });
  },

  adjustStock(accessToken: string, storeId: string, input: AdjustStockRequest): Promise<AdjustStockResponse> {
    return apiFetch<AdjustStockResponse>(`/api/stores/${storeId}/inventory/adjustments`, {
      method: "POST",
      accessToken,
      body: input,
    });
  },
};
