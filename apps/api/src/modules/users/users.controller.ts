import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { ListOrgUsersUseCase } from "./usecases/ListOrgUsers.usecase.js";
import { toOrgMemberResponse } from "./dto/user.mapper.js";

@Controller("api/users")
@UseGuards(AuthGuard, RolesGuard)
@Roles("OWNER", "ADMIN", "MANAGER")
export class UsersController {
  constructor(private readonly listOrgUsers: ListOrgUsersUseCase) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const users = await this.listOrgUsers.execute(auth.organizationId);
    return users.map(toOrgMemberResponse);
  }
}
