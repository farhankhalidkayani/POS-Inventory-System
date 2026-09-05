import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { adjustStockRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { GetStoreInventoryUseCase } from "./usecases/GetStoreInventory.usecase.js";
import { AdjustStockUseCase } from "./usecases/AdjustStock.usecase.js";
import { toAdjustStockResponse, toInventoryItemResponse } from "./dto/inventory.mapper.js";

@Controller("api/stores/:storeId/inventory")
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(
    private readonly getStoreInventory: GetStoreInventoryUseCase,
    private readonly adjustStock: AdjustStockUseCase
  ) {}

  @Get()
  async list(@Param("storeId") storeId: string, @CurrentAuth() auth: AuthContext) {
    const items = await this.getStoreInventory.execute(auth.organizationId, storeId);
    return items.map(toInventoryItemResponse);
  }

  @Post("adjustments")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async adjust(@Param("storeId") storeId: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = adjustStockRequestSchema.parse(body);
    const { inventoryItem, movement } = await this.adjustStock.execute(auth.organizationId, storeId, input);
    return toAdjustStockResponse(inventoryItem, movement);
  }
}
