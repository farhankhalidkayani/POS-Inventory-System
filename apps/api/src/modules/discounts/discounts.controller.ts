import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { createDiscountRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateDiscountUseCase } from "./usecases/CreateDiscount.usecase.js";
import { ListDiscountsUseCase } from "./usecases/ListDiscounts.usecase.js";
import { toDiscountResponse } from "./dto/discount.mapper.js";

@Controller("api/discounts")
@UseGuards(AuthGuard)
export class DiscountsController {
  constructor(
    private readonly createDiscount: CreateDiscountUseCase,
    private readonly listDiscounts: ListDiscountsUseCase
  ) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const discounts = await this.listDiscounts.execute(auth.organizationId);
    return discounts.map(toDiscountResponse);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createDiscountRequestSchema.parse(body);
    const discount = await this.createDiscount.execute(auth.organizationId, input);
    return toDiscountResponse(discount);
  }
}
