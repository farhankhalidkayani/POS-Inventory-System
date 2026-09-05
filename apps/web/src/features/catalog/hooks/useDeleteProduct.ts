import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";
import { PRODUCTS_QUERY_KEY } from "./useProducts";

export function useDeleteProduct() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => catalogApi.deleteProduct(session!.accessToken, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
