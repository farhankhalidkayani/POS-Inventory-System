import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { teamApi } from "../api/teamApi";

export const INVITES_QUERY_KEY = ["invites"] as const;

export function useInvites() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: INVITES_QUERY_KEY,
    queryFn: () => teamApi.listInvites(session!.accessToken),
    enabled: !!session,
  });
}
