import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { inventoryApi } from "../api/inventoryApi";
import { storeInventoryQueryKey } from "./useStoreInventory";

export function useSetReorderThreshold(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reorderThreshold }: { productId: string; reorderThreshold: number }) =>
      inventoryApi.setReorderThreshold(session!.accessToken, storeId!, productId, { reorderThreshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeInventoryQueryKey(storeId ?? "") });
    },
  });
}
