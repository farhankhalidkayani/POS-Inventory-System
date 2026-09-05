import type { FastifyInstance } from "fastify";
import type { AuthController } from "./auth.controller.js";
import type { createAuthenticateMiddleware } from "../../shared/middleware/authenticate.js";

export function registerAuthRoutes(
  app: FastifyInstance,
  controller: AuthController,
  authenticate: ReturnType<typeof createAuthenticateMiddleware>
): void {
  app.post("/api/auth/register", controller.register);
  app.post("/api/auth/login", controller.login);
  app.post("/api/auth/refresh", controller.refresh);
  app.post("/api/auth/logout", controller.logout);
  app.get("/api/auth/me", { preHandler: authenticate }, controller.me);
}
