import type { FastifyInstance } from "fastify";
import type { createAuthenticateMiddleware } from "../../shared/middleware/authenticate.js";
import type { OrganizationsController } from "./organizations.controller.js";

export function registerOrganizationsRoutes(
  app: FastifyInstance,
  controller: OrganizationsController,
  authenticate: ReturnType<typeof createAuthenticateMiddleware>
): void {
  app.get("/api/organizations/me", { preHandler: authenticate }, controller.me);
}
