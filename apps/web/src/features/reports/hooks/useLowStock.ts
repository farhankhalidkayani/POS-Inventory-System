import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { reportsApi } from "../api/reportsApi";

export function useLowStock(storeId: string | undefined) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ["reports", "low-stock", storeId],
    queryFn: () => reportsApi.getLowStock(session!.accessToken, storeId!),
    enabled: !!session && !!storeId,
  });
}
