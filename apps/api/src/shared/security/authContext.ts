import "fastify";
import type { Role } from "@pos/shared";

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: Role;
}

declare module "fastify" {
  interface FastifyRequest {
    authContext?: AuthContext;
  }
}
