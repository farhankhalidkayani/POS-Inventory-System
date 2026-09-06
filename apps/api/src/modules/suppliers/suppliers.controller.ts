import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { createSupplierRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateSupplierUseCase } from "./usecases/CreateSupplier.usecase.js";
import { ListSuppliersUseCase } from "./usecases/ListSuppliers.usecase.js";
import { toSupplierResponse } from "./dto/supplier.mapper.js";

@Controller("api/suppliers")
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(
    private readonly createSupplier: CreateSupplierUseCase,
    private readonly listSuppliers: ListSuppliersUseCase
  ) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const suppliers = await this.listSuppliers.execute(auth.organizationId);
    return suppliers.map(toSupplierResponse);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createSupplierRequestSchema.parse(body);
    const supplier = await this.createSupplier.execute(auth.organizationId, input);
    return toSupplierResponse(supplier);
  }
}
