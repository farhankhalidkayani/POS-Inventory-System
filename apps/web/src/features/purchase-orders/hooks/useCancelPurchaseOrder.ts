import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { purchaseOrdersApi } from "../api/purchaseOrdersApi";
import { storePurchaseOrdersQueryKey } from "./useStorePurchaseOrders";

export function useCancelPurchaseOrder(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseOrderId: string) =>
      purchaseOrdersApi.cancelPurchaseOrder(session!.accessToken, storeId!, purchaseOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storePurchaseOrdersQueryKey(storeId ?? "") });
    },
  });
}
