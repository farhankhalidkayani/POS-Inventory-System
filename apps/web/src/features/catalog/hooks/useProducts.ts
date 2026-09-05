import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export function useProducts() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => catalogApi.listProducts(session!.accessToken),
    enabled: !!session,
  });
}
