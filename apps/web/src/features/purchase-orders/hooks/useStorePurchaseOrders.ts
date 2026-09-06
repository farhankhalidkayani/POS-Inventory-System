import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { purchaseOrdersApi } from "../api/purchaseOrdersApi";

export function storePurchaseOrdersQueryKey(storeId: string) {
  return ["purchase-orders", storeId] as const;
}

export function useStorePurchaseOrders(storeId: string | undefined) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: storePurchaseOrdersQueryKey(storeId ?? ""),
    queryFn: () => purchaseOrdersApi.listStorePurchaseOrders(session!.accessToken, storeId!),
    enabled: !!session && !!storeId,
  });
}
