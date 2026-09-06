import "fastify";
import type { OrganizationStatus, Role } from "@pos/shared";

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: Role;
  organizationStatus: OrganizationStatus;
  isPlatformAdmin: boolean;
}

declare module "fastify" {
  interface FastifyRequest {
    authContext?: AuthContext;
  }
}
