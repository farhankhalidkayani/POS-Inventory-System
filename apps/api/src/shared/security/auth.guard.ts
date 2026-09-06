import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import { TokenService } from "./token.service.js";
import { SKIP_ORG_APPROVAL_KEY } from "./skipOrgApproval.decorator.js";
import "./authContext.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    try {
      request.authContext = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    const skipOrgApproval = this.reflector.getAllAndOverride<boolean | undefined>(SKIP_ORG_APPROVAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { organizationStatus, isPlatformAdmin } = request.authContext;
    if (!skipOrgApproval && !isPlatformAdmin && organizationStatus !== "APPROVED") {
      throw new ForbiddenError(
        organizationStatus === "REJECTED"
          ? "Your organization's registration was not approved"
          : "Your organization is still pending approval"
      );
    }

    return true;
  }
}
