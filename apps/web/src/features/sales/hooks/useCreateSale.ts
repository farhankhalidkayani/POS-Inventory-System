import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSaleRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { storeInventoryQueryKey } from "../../inventory";
import { salesApi } from "../api/salesApi";
import { storeSalesQueryKey } from "./useStoreSales";

export function useCreateSale(storeId: string | undefined) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSaleRequest) => salesApi.createSale(session!.accessToken, storeId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeSalesQueryKey(storeId ?? "") });
      queryClient.invalidateQueries({ queryKey: storeInventoryQueryKey(storeId ?? "") });
    },
  });
}
