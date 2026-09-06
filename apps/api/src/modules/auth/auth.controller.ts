import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { loginRequestSchema, registerOrganizationRequestSchema } from "@pos/shared";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { GetCurrentUserUseCase } from "./usecases/GetCurrentUser.usecase.js";
import { LoginUserUseCase } from "./usecases/LoginUser.usecase.js";
import { RefreshTokenUseCase } from "./usecases/RefreshToken.usecase.js";
import { RegisterOrganizationOwnerUseCase } from "./usecases/RegisterOrganizationOwner.usecase.js";
import { toAuthSessionResponse, toCurrentUserResponse } from "./dto/auth.mapper.js";

export const REFRESH_TOKEN_COOKIE = "pos_refresh_token";

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/api/auth",
  secure: process.env.NODE_ENV === "production",
};

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly registerOrganizationOwner: RegisterOrganizationOwnerUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase
  ) {}

  @Post("register")
  async register(@Body() body: unknown, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = registerOrganizationRequestSchema.parse(body);
    const result = await this.registerOrganizationOwner.execute(input);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(201);
    return toAuthSessionResponse(result);
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = loginRequestSchema.parse(body);
    const result = await this.loginUser.execute(input);

    if (!result.store) {
      throw new UnauthorizedError("Account is not associated with a store");
    }

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(200);
    return toAuthSessionResponse({ ...result, store: result.store });
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const token = request.cookies[REFRESH_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedError("Missing refresh token");
    }

    const result = await this.refreshToken.execute(token);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken: result.accessToken };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
    reply.status(204);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentAuth() auth: AuthContext) {
    const result = await this.getCurrentUser.execute(auth.organizationId, auth.userId);
    return toCurrentUserResponse(result);
  }
}
