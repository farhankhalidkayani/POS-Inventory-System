import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { platformAdminApi } from "../api/platformAdminApi";

export const PENDING_ORGANIZATIONS_QUERY_KEY = ["platform-organizations", "PENDING"] as const;

export function usePendingOrganizations() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: PENDING_ORGANIZATIONS_QUERY_KEY,
    queryFn: () => platformAdminApi.listOrganizations(session!.accessToken, "PENDING"),
    enabled: !!session,
  });
}
