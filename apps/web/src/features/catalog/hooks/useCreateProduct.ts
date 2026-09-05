import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";
import { PRODUCTS_QUERY_KEY } from "./useProducts";

export function useCreateProduct() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductRequest) => catalogApi.createProduct(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
