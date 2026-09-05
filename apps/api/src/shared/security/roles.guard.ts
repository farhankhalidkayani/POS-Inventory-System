import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@pos/shared";
import type { FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import { ROLES_KEY } from "./roles.decorator.js";
import "./authContext.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authContext = request.authContext;
    if (!authContext) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!allowedRoles.includes(authContext.role)) {
      throw new ForbiddenError("You do not have permission to perform this action");
    }

    return true;
  }
}
