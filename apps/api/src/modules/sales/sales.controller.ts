import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { createSaleRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateSaleUseCase } from "./usecases/CreateSale.usecase.js";
import { ListStoreSalesUseCase } from "./usecases/ListStoreSales.usecase.js";
import { toSaleResponse } from "./dto/sale.mapper.js";

@Controller("api/stores/:storeId/sales")
@UseGuards(AuthGuard)
export class SalesController {
  constructor(
    private readonly createSale: CreateSaleUseCase,
    private readonly listStoreSales: ListStoreSalesUseCase
  ) {}

  @Get()
  async list(@Param("storeId") storeId: string, @CurrentAuth() auth: AuthContext) {
    const sales = await this.listStoreSales.execute(auth.organizationId, storeId);
    return sales.map(toSaleResponse);
  }

  @Post()
  async create(@Param("storeId") storeId: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createSaleRequestSchema.parse(body);
    const sale = await this.createSale.execute(auth.organizationId, storeId, auth.userId, input);
    return toSaleResponse(sale);
  }
}
