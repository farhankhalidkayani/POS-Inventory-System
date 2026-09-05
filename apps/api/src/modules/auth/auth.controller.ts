import type { FastifyReply, FastifyRequest } from "fastify";
import { loginRequestSchema, registerOrganizationRequestSchema } from "@pos/shared";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import type { GetCurrentUserUseCase } from "./usecases/GetCurrentUser.usecase.js";
import type { LoginUserUseCase } from "./usecases/LoginUser.usecase.js";
import type { RefreshTokenUseCase } from "./usecases/RefreshToken.usecase.js";
import type { RegisterOrganizationOwnerUseCase } from "./usecases/RegisterOrganizationOwner.usecase.js";
import { toAuthSessionResponse, toCurrentUserResponse } from "./dto/auth.mapper.js";

export const REFRESH_TOKEN_COOKIE = "pos_refresh_token";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/api/auth",
  secure: process.env.NODE_ENV === "production",
};

export class AuthController {
  constructor(
    private readonly registerOrganizationOwner: RegisterOrganizationOwnerUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase
  ) {}

  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = registerOrganizationRequestSchema.parse(request.body);
    const result = await this.registerOrganizationOwner.execute(input);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(201).send(toAuthSessionResponse(result));
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = loginRequestSchema.parse(request.body);
    const result = await this.loginUser.execute(input);

    if (!result.store) {
      throw new UnauthorizedError("Account is not associated with a store");
    }

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(200).send(toAuthSessionResponse({ ...result, store: result.store }));
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const token = request.cookies[REFRESH_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedError("Missing refresh token");
    }

    const result = await this.refreshToken.execute(token);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(200).send({ accessToken: result.accessToken });
  };

  logout = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
    reply.status(204).send();
  };

  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const context = request.authContext;
    if (!context) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = await this.getCurrentUser.execute(context.organizationId, context.userId);
    reply.status(200).send(toCurrentUserResponse(result));
  };
}
