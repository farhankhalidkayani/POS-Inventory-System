import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import { AppModule } from "./app.module.js";
import { AppExceptionFilter } from "./shared/errors/app-exception.filter.js";
import { ENV } from "./shared/di/tokens.js";
import type { Env } from "./shared/config/env.js";

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({
    logger: process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  const env = app.get<Env>(ENV);

  app.enableCors({ origin: env.CORS_ORIGIN, credentials: true });
  await app.register(fastifyCookie);
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(env.PORT, "0.0.0.0");
}

bootstrap();
