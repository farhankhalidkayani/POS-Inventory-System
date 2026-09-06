import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { platformAdminApi } from "../api/platformAdminApi";
import { ORGANIZATIONS_QUERY_KEY } from "./useOrganizations";

export function useApproveOrganization() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => platformAdminApi.approveOrganization(session!.accessToken, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
    },
  });
}

export function useRejectOrganization() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => platformAdminApi.rejectOrganization(session!.accessToken, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
    },
  });
}

export function useSuspendOrganization() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => platformAdminApi.suspendOrganization(session!.accessToken, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
    },
  });
}
