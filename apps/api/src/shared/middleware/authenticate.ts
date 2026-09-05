import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/AppError.js";
import type { TokenService } from "../../modules/auth/services/TokenService.js";
import "./authContext.js";

export function createAuthenticateMiddleware(tokenService: TokenService) {
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    try {
      const payload = tokenService.verifyAccessToken(token);
      request.authContext = payload;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  };
}
