import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdjustStockRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { inventoryApi } from "../api/inventoryApi";
import { storeInventoryQueryKey } from "./useStoreInventory";

export function useAdjustStock(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdjustStockRequest) => inventoryApi.adjustStock(session!.accessToken, storeId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeInventoryQueryKey(storeId ?? "") });
    },
  });
}
