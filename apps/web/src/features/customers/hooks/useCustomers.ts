import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { customersApi } from "../api/customersApi";

export const CUSTOMERS_QUERY_KEY = ["customers"] as const;

export function useCustomers() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: () => customersApi.listCustomers(session!.accessToken),
    enabled: !!session,
  });
}
