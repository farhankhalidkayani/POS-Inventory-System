import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

export function useCategories() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => catalogApi.listCategories(session!.accessToken),
    enabled: !!session,
  });
}
