import type { PlatformOrganizationResponse } from "@pos/shared";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { User } from "../../users/entities/User.js";

export function toPlatformOrganizationResponse(
  organization: Organization,
  owner: User | null
): PlatformOrganizationResponse {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    status: organization.status,
    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : null,
    ownerEmail: owner ? owner.email : null,
    createdAt: organization.createdAt.toISOString(),
    approvedAt: organization.approvedAt ? organization.approvedAt.toISOString() : null,
    rejectedAt: organization.rejectedAt ? organization.rejectedAt.toISOString() : null,
  };
}
