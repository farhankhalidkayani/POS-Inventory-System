import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { PURCHASE_ORDERS_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.js";

@Injectable()
export class ListStorePurchaseOrdersUseCase {
  constructor(
    @Inject(PURCHASE_ORDERS_REPOSITORY) private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string): Promise<PurchaseOrderWithDetails[]> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    return this.purchaseOrdersRepository.listByStore(organizationId, storeId);
  }
}
