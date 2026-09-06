import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { createPurchaseOrderRequestSchema, receivePurchaseOrderRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreatePurchaseOrderUseCase } from "./usecases/CreatePurchaseOrder.usecase.js";
import { ListStorePurchaseOrdersUseCase } from "./usecases/ListStorePurchaseOrders.usecase.js";
import { ReceivePurchaseOrderUseCase } from "./usecases/ReceivePurchaseOrder.usecase.js";
import { CancelPurchaseOrderUseCase } from "./usecases/CancelPurchaseOrder.usecase.js";
import { toPurchaseOrderResponse } from "./dto/purchaseOrder.mapper.js";

@Controller("api/stores/:storeId/purchase-orders")
@UseGuards(AuthGuard)
export class PurchaseOrdersController {
  constructor(
    private readonly createPurchaseOrder: CreatePurchaseOrderUseCase,
    private readonly listStorePurchaseOrders: ListStorePurchaseOrdersUseCase,
    private readonly receivePurchaseOrder: ReceivePurchaseOrderUseCase,
    private readonly cancelPurchaseOrder: CancelPurchaseOrderUseCase
  ) {}

  @Get()
  async list(@Param("storeId") storeId: string, @CurrentAuth() auth: AuthContext) {
    const purchaseOrders = await this.listStorePurchaseOrders.execute(auth.organizationId, storeId);
    return purchaseOrders.map(toPurchaseOrderResponse);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async create(@Param("storeId") storeId: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createPurchaseOrderRequestSchema.parse(body);
    const purchaseOrder = await this.createPurchaseOrder.execute(auth.organizationId, storeId, input);
    return toPurchaseOrderResponse(purchaseOrder);
  }

  @Post(":purchaseOrderId/receive")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async receive(
    @Param("storeId") storeId: string,
    @Param("purchaseOrderId") purchaseOrderId: string,
    @Body() body: unknown,
    @CurrentAuth() auth: AuthContext
  ) {
    const input = receivePurchaseOrderRequestSchema.parse(body);
    const purchaseOrder = await this.receivePurchaseOrder.execute(auth.organizationId, storeId, purchaseOrderId, input);
    return toPurchaseOrderResponse(purchaseOrder);
  }

  @Post(":purchaseOrderId/cancel")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async cancel(
    @Param("storeId") storeId: string,
    @Param("purchaseOrderId") purchaseOrderId: string,
    @CurrentAuth() auth: AuthContext
  ) {
    const purchaseOrder = await this.cancelPurchaseOrder.execute(auth.organizationId, storeId, purchaseOrderId);
    return toPurchaseOrderResponse(purchaseOrder);
  }
}
