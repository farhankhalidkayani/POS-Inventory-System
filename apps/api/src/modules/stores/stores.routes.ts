import type { FastifyInstance } from "fastify";
import type { createAuthenticateMiddleware } from "../../shared/middleware/authenticate.js";
import type { StoresController } from "./stores.controller.js";

export function registerStoresRoutes(
  app: FastifyInstance,
  controller: StoresController,
  authenticate: ReturnType<typeof createAuthenticateMiddleware>
): void {
  app.get("/api/stores", { preHandler: authenticate }, controller.list);
}
