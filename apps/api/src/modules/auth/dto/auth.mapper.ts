import type {
  AuthSessionResponse,
  AuthUserResponse,
  CurrentUserResponse,
  OrganizationResponse,
  StoreResponse,
} from "@pos/shared";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { Store } from "../../stores/entities/Store.js";
import type { User } from "../../users/entities/User.js";

export function toUserResponse(user: User): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizationId: user.organizationId,
    isPlatformAdmin: user.isPlatformAdmin,
  };
}

export function toOrganizationResponse(organization: Organization): OrganizationResponse {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    status: organization.status,
  };
}

export function toStoreResponse(store: Store): StoreResponse {
  return { id: store.id, name: store.name, address: store.address };
}

export function toAuthSessionResponse(input: {
  accessToken: string;
  user: User;
  organization: Organization;
  store: Store;
}): AuthSessionResponse {
  return {
    accessToken: input.accessToken,
    user: toUserResponse(input.user),
    organization: toOrganizationResponse(input.organization),
    store: toStoreResponse(input.store),
  };
}

export function toCurrentUserResponse(input: {
  user: User;
  organization: Organization;
  store: Store | null;
}): CurrentUserResponse {
  return {
    user: toUserResponse(input.user),
    organization: toOrganizationResponse(input.organization),
    store: input.store ? toStoreResponse(input.store) : null,
  };
}
