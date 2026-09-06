import { useQuery } from "@tanstack/react-query";
import { teamApi } from "../api/teamApi";

export function useInviteDetails(token: string | null) {
  return useQuery({
    queryKey: ["invite-details", token],
    queryFn: () => teamApi.getInviteDetails(token!),
    enabled: !!token,
    retry: false,
  });
}
