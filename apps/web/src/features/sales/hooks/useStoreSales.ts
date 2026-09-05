import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { salesApi } from "../api/salesApi";

export function storeSalesQueryKey(storeId: string) {
  return ["sales", storeId] as const;
}

export function useStoreSales(storeId: string | undefined) {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: storeSalesQueryKey(storeId ?? ""),
    queryFn: () => salesApi.listStoreSales(session!.accessToken, storeId!),
    enabled: !!session && !!storeId,
  });
}
