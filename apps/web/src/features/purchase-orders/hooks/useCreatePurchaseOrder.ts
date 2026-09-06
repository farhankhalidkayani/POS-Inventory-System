import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePurchaseOrderRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { purchaseOrdersApi } from "../api/purchaseOrdersApi";
import { storePurchaseOrdersQueryKey } from "./useStorePurchaseOrders";

export function useCreatePurchaseOrder(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePurchaseOrderRequest) =>
      purchaseOrdersApi.createPurchaseOrder(session!.accessToken, storeId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storePurchaseOrdersQueryKey(storeId ?? "") });
    },
  });
}
