import type { OrganizationStatus, PlatformOrganizationResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const platformAdminApi = {
  listOrganizations(accessToken: string, status?: OrganizationStatus): Promise<PlatformOrganizationResponse[]> {
    const query = status ? `?status=${status}` : "";
    return apiFetch<PlatformOrganizationResponse[]>(`/api/platform/organizations${query}`, { accessToken });
  },

  approveOrganization(accessToken: string, organizationId: string): Promise<PlatformOrganizationResponse> {
    return apiFetch<PlatformOrganizationResponse>(`/api/platform/organizations/${organizationId}/approve`, {
      method: "POST",
      accessToken,
    });
  },

  rejectOrganization(accessToken: string, organizationId: string): Promise<PlatformOrganizationResponse> {
    return apiFetch<PlatformOrganizationResponse>(`/api/platform/organizations/${organizationId}/reject`, {
      method: "POST",
      accessToken,
    });
  },

  suspendOrganization(accessToken: string, organizationId: string): Promise<PlatformOrganizationResponse> {
    return apiFetch<PlatformOrganizationResponse>(`/api/platform/organizations/${organizationId}/suspend`, {
      method: "POST",
      accessToken,
    });
  },
};
