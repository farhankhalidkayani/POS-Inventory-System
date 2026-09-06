import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { reportsApi } from "../api/reportsApi";

export function useTopProducts(storeId: string | undefined, days = 30, limit = 5) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ["reports", "top-products", storeId, days, limit],
    queryFn: () => reportsApi.getTopProducts(session!.accessToken, storeId!, days, limit),
    enabled: !!session && !!storeId,
  });
}
