import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { inventoryApi } from "../api/inventoryApi";

export function storeInventoryQueryKey(storeId: string) {
  return ["inventory", storeId] as const;
}

export function useStoreInventory(storeId: string | undefined) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: storeInventoryQueryKey(storeId ?? ""),
    queryFn: () => inventoryApi.listStoreInventory(session!.accessToken, storeId!),
    enabled: !!session && !!storeId,
  });
}
