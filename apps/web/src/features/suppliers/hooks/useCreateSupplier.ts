import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSupplierRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { suppliersApi } from "../api/suppliersApi";
import { SUPPLIERS_QUERY_KEY } from "./useSuppliers";

export function useCreateSupplier() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSupplierRequest) => suppliersApi.createSupplier(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}
