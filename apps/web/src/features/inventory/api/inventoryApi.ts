import type { AdjustStockRequest, AdjustStockResponse, InventoryItemResponse, SetReorderThresholdRequest } from "@pos/shared";
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

  setReorderThreshold(
    accessToken: string,
    storeId: string,
    productId: string,
    input: SetReorderThresholdRequest
  ): Promise<{ quantity: number; reorderThreshold: number }> {
    return apiFetch(`/api/stores/${storeId}/inventory/${productId}/reorder-threshold`, {
      method: "PATCH",
      accessToken,
      body: input,
    });
  },
};
