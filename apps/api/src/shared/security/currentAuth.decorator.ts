import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/AppError.js";
import type { AuthContext } from "./authContext.js";
import "./authContext.js";

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext): AuthContext => {
  const request = context.switchToHttp().getRequest<FastifyRequest>();
  if (!request.authContext) {
    throw new UnauthorizedError("Authentication required");
  }
  return request.authContext;
});
