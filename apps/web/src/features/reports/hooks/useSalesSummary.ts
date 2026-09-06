import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { reportsApi } from "../api/reportsApi";

export function useSalesSummary(storeId: string | undefined, days = 7) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ["reports", "sales-summary", storeId, days],
    queryFn: () => reportsApi.getSalesSummary(session!.accessToken, storeId!, days),
    enabled: !!session && !!storeId,
  });
}
