import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { suppliersApi } from "../api/suppliersApi";

export const SUPPLIERS_QUERY_KEY = ["suppliers"] as const;

export function useSuppliers() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: () => suppliersApi.listSuppliers(session!.accessToken),
    enabled: !!session,
  });
}
