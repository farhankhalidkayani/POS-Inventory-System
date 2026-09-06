import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateDiscountRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { discountsApi } from "../api/discountsApi";
import { DISCOUNTS_QUERY_KEY } from "./useDiscounts";

export function useCreateDiscount() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDiscountRequest) => discountsApi.createDiscount(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNTS_QUERY_KEY });
    },
  });
}
