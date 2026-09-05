import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { toStoreResponse } from "../auth/dto/auth.mapper.js";
import { ListStoresForOrganizationUseCase } from "./usecases/ListStoresForOrganization.usecase.js";

@Controller("api/stores")
export class StoresController {
  constructor(private readonly listStoresForOrganization: ListStoresForOrganizationUseCase) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@CurrentAuth() auth: AuthContext) {
    const stores = await this.listStoresForOrganization.execute(auth.organizationId);
    return stores.map(toStoreResponse);
  }
}
