import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomerRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { customersApi } from "../api/customersApi";
import { CUSTOMERS_QUERY_KEY } from "./useCustomers";

export function useCreateCustomer() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerRequest) => customersApi.createCustomer(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
