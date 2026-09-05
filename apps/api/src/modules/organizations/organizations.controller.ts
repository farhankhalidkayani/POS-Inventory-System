import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { toOrganizationResponse } from "../auth/dto/auth.mapper.js";
import { GetCurrentOrganizationUseCase } from "./usecases/GetCurrentOrganization.usecase.js";

@Controller("api/organizations")
export class OrganizationsController {
  constructor(private readonly getCurrentOrganization: GetCurrentOrganizationUseCase) {}

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentAuth() auth: AuthContext) {
    const organization = await this.getCurrentOrganization.execute(auth.organizationId);
    return toOrganizationResponse(organization);
  }
}
