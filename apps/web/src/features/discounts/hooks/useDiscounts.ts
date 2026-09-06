import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { discountsApi } from "../api/discountsApi";

export const DISCOUNTS_QUERY_KEY = ["discounts"] as const;

export function useDiscounts() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: DISCOUNTS_QUERY_KEY,
    queryFn: () => discountsApi.listDiscounts(session!.accessToken),
    enabled: !!session,
  });
}
