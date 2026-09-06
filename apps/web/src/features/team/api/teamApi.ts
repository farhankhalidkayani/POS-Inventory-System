import type {
  AcceptInviteRequest,
  AuthSessionResponse,
  CreateInviteRequest,
  InviteDetailsResponse,
  InviteResponse,
  OrgMemberResponse,
} from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const teamApi = {
  listMembers(accessToken: string): Promise<OrgMemberResponse[]> {
    return apiFetch<OrgMemberResponse[]>("/api/users", { accessToken });
  },

  listInvites(accessToken: string): Promise<InviteResponse[]> {
    return apiFetch<InviteResponse[]>("/api/invites", { accessToken });
  },

  createInvite(accessToken: string, input: CreateInviteRequest): Promise<InviteResponse> {
    return apiFetch<InviteResponse>("/api/invites", { method: "POST", accessToken, body: input });
  },

  revokeInvite(accessToken: string, inviteId: string): Promise<void> {
    return apiFetch<void>(`/api/invites/${inviteId}`, { method: "DELETE", accessToken });
  },

  getInviteDetails(token: string): Promise<InviteDetailsResponse> {
    return apiFetch<InviteDetailsResponse>(`/api/invites/token/${token}`);
  },

  acceptInvite(input: AcceptInviteRequest): Promise<AuthSessionResponse> {
    return apiFetch<AuthSessionResponse>("/api/invites/accept", { method: "POST", body: input });
  },
};
