import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { teamApi } from "../api/teamApi";

export const ORG_MEMBERS_QUERY_KEY = ["org-members"] as const;

export function useOrgMembers() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ORG_MEMBERS_QUERY_KEY,
    queryFn: () => teamApi.listMembers(session!.accessToken),
    enabled: !!session,
  });
}
