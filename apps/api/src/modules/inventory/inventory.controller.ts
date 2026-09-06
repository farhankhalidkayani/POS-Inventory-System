import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { adjustStockRequestSchema, setReorderThresholdRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { GetStoreInventoryUseCase } from "./usecases/GetStoreInventory.usecase.js";
import { AdjustStockUseCase } from "./usecases/AdjustStock.usecase.js";
import { SetReorderThresholdUseCase } from "./usecases/SetReorderThreshold.usecase.js";
import { toAdjustStockResponse, toInventoryItemResponse } from "./dto/inventory.mapper.js";

@Controller("api/stores/:storeId/inventory")
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(
    private readonly getStoreInventory: GetStoreInventoryUseCase,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly setReorderThreshold: SetReorderThresholdUseCase
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

  @Patch(":productId/reorder-threshold")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async setThreshold(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Body() body: unknown,
    @CurrentAuth() auth: AuthContext
  ) {
    const input = setReorderThresholdRequestSchema.parse(body);
    const item = await this.setReorderThreshold.execute(auth.organizationId, storeId, productId, input.reorderThreshold);
    return { quantity: item.quantity, reorderThreshold: item.reorderThreshold };
  }
}
