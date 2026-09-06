import type { PlatformOrganizationResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const platformAdminApi = {
  listOrganizations(accessToken: string, status = "PENDING"): Promise<PlatformOrganizationResponse[]> {
    return apiFetch<PlatformOrganizationResponse[]>(`/api/platform/organizations?status=${status}`, { accessToken });
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
};
