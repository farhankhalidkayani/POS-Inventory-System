import { Body, Controller, Delete, Get, HttpCode, Param, Post, Res, UseGuards } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { acceptInviteRequestSchema, createInviteRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { toAuthSessionResponse } from "../auth/dto/auth.mapper.js";
import { REFRESH_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE } from "../auth/auth.controller.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { CreateInviteUseCase } from "./usecases/CreateInvite.usecase.js";
import { ListInvitesUseCase } from "./usecases/ListInvites.usecase.js";
import { RevokeInviteUseCase } from "./usecases/RevokeInvite.usecase.js";
import { GetInviteDetailsUseCase } from "./usecases/GetInviteDetails.usecase.js";
import { AcceptInviteUseCase } from "./usecases/AcceptInvite.usecase.js";
import { toInviteResponse } from "./dto/invite.mapper.js";

@Controller("api/invites")
export class InvitesController {
  constructor(
    private readonly createInvite: CreateInviteUseCase,
    private readonly listInvites: ListInvitesUseCase,
    private readonly revokeInvite: RevokeInviteUseCase,
    private readonly getInviteDetails: GetInviteDetailsUseCase,
    private readonly acceptInvite: AcceptInviteUseCase
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  async list(@CurrentAuth() auth: AuthContext) {
    const invites = await this.listInvites.execute(auth.organizationId);
    return invites.map(toInviteResponse);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createInviteRequestSchema.parse(body);
    const invite = await this.createInvite.execute(auth.organizationId, auth.role, input);
    return toInviteResponse(invite);
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("OWNER", "ADMIN")
  async revoke(@Param("id") id: string, @CurrentAuth() auth: AuthContext) {
    await this.revokeInvite.execute(auth.organizationId, id);
  }

  @Get("token/:token")
  async details(@Param("token") token: string) {
    return this.getInviteDetails.execute(token);
  }

  @Post("accept")
  async accept(@Body() body: unknown, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = acceptInviteRequestSchema.parse(body);
    const result = await this.acceptInvite.execute(input);

    if (!result.store) {
      throw new UnauthorizedError("Organization is not associated with a store");
    }

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    reply.status(201);
    return toAuthSessionResponse({ ...result, store: result.store });
  }
}
