import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "@pos/shared";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

export function authorize(allowedRoles: readonly Role[]) {
  return async function authorizeRole(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const context = request.authContext;
    if (!context) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!allowedRoles.includes(context.role)) {
      throw new ForbiddenError("You do not have permission to perform this action");
    }
  };
}
