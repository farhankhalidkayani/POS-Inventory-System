import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateInviteRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { teamApi } from "../api/teamApi";
import { INVITES_QUERY_KEY } from "./useInvites";

export function useCreateInvite() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInviteRequest) => teamApi.createInvite(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY });
    },
  });
}
