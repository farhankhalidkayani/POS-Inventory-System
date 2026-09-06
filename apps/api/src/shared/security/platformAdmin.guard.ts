import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import "./authContext.js";

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authContext = request.authContext;
    if (!authContext) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError("Platform admin access required");
    }
    return true;
  }
}
