import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import type { Env } from "./shared/config/env.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import { buildContainer } from "./composition/container.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerOrganizationsRoutes } from "./modules/organizations/organizations.routes.js";
import { registerStoresRoutes } from "./modules/stores/stores.routes.js";

export async function buildServer(env: Env): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : true,
  });

  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(cookie);

  app.setErrorHandler(errorHandler);

  const container = buildContainer(env);

  app.get("/health", async () => ({ status: "ok" }));

  registerAuthRoutes(app, container.authController, container.authenticate);
  registerOrganizationsRoutes(app, container.organizationsController, container.authenticate);
  registerStoresRoutes(app, container.storesController, container.authenticate);

  app.addHook("onClose", async () => {
    await container.prisma.$disconnect();
  });

  return app;
}
