import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReceivePurchaseOrderRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { storeInventoryQueryKey } from "../../inventory";
import { purchaseOrdersApi } from "../api/purchaseOrdersApi";
import { storePurchaseOrdersQueryKey } from "./useStorePurchaseOrders";

export function useReceivePurchaseOrder(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseOrderId, input }: { purchaseOrderId: string; input: ReceivePurchaseOrderRequest }) =>
      purchaseOrdersApi.receivePurchaseOrder(session!.accessToken, storeId!, purchaseOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storePurchaseOrdersQueryKey(storeId ?? "") });
      queryClient.invalidateQueries({ queryKey: storeInventoryQueryKey(storeId ?? "") });
    },
  });
}
