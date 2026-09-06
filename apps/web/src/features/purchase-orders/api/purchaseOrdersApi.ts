import type { CreatePurchaseOrderRequest, PurchaseOrderResponse, ReceivePurchaseOrderRequest } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const purchaseOrdersApi = {
  listStorePurchaseOrders(accessToken: string, storeId: string): Promise<PurchaseOrderResponse[]> {
    return apiFetch<PurchaseOrderResponse[]>(`/api/stores/${storeId}/purchase-orders`, { accessToken });
  },

  createPurchaseOrder(
    accessToken: string,
    storeId: string,
    input: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrderResponse> {
    return apiFetch<PurchaseOrderResponse>(`/api/stores/${storeId}/purchase-orders`, {
      method: "POST",
      accessToken,
      body: input,
    });
  },

  receivePurchaseOrder(
    accessToken: string,
    storeId: string,
    purchaseOrderId: string,
    input: ReceivePurchaseOrderRequest
  ): Promise<PurchaseOrderResponse> {
    return apiFetch<PurchaseOrderResponse>(`/api/stores/${storeId}/purchase-orders/${purchaseOrderId}/receive`, {
      method: "POST",
      accessToken,
      body: input,
    });
  },

  cancelPurchaseOrder(accessToken: string, storeId: string, purchaseOrderId: string): Promise<PurchaseOrderResponse> {
    return apiFetch<PurchaseOrderResponse>(`/api/stores/${storeId}/purchase-orders/${purchaseOrderId}/cancel`, {
      method: "POST",
      accessToken,
    });
  },
};
