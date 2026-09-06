import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { teamApi } from "../api/teamApi";
import { INVITES_QUERY_KEY } from "./useInvites";

export function useRevokeInvite() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => teamApi.revokeInvite(session!.accessToken, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY });
    },
  });
}
