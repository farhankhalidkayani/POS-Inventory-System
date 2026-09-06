import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { platformAdminApi } from "../api/platformAdminApi";

export const ORGANIZATIONS_QUERY_KEY = ["platform-organizations"] as const;

export function useOrganizations() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: () => platformAdminApi.listOrganizations(session!.accessToken),
    enabled: !!session,
  });
}
