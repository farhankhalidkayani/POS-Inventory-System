import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { toInventoryItemResponse } from "../inventory/dto/inventory.mapper.js";
import { GetSalesSummaryUseCase } from "./usecases/GetSalesSummary.usecase.js";
import { GetTopProductsUseCase } from "./usecases/GetTopProducts.usecase.js";
import { GetLowStockItemsUseCase } from "./usecases/GetLowStockItems.usecase.js";
import { toSalesSummaryResponse, toTopProductResponse } from "./dto/report.mapper.js";

function parsePositiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

@Controller("api/stores/:storeId/reports")
@UseGuards(AuthGuard, RolesGuard)
@Roles("OWNER", "ADMIN", "MANAGER")
export class ReportsController {
  constructor(
    private readonly getSalesSummary: GetSalesSummaryUseCase,
    private readonly getTopProducts: GetTopProductsUseCase,
    private readonly getLowStockItems: GetLowStockItemsUseCase
  ) {}

  @Get("sales-summary")
  async salesSummary(
    @Param("storeId") storeId: string,
    @Query("days") daysParam: unknown,
    @CurrentAuth() auth: AuthContext
  ) {
    const days = parsePositiveInt(daysParam, 7, 365);
    const summary = await this.getSalesSummary.execute(auth.organizationId, storeId, days);
    return toSalesSummaryResponse(summary);
  }

  @Get("top-products")
  async topProducts(
    @Param("storeId") storeId: string,
    @Query("days") daysParam: unknown,
    @Query("limit") limitParam: unknown,
    @CurrentAuth() auth: AuthContext
  ) {
    const days = parsePositiveInt(daysParam, 30, 365);
    const limit = parsePositiveInt(limitParam, 5, 50);
    const topProducts = await this.getTopProducts.execute(auth.organizationId, storeId, days, limit);
    return topProducts.map(toTopProductResponse);
  }

  @Get("low-stock")
  async lowStock(@Param("storeId") storeId: string, @CurrentAuth() auth: AuthContext) {
    const items = await this.getLowStockItems.execute(auth.organizationId, storeId);
    return items.map(toInventoryItemResponse);
  }
}
