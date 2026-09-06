import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { PURCHASE_ORDERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.js";

@Injectable()
export class CancelPurchaseOrderUseCase {
  constructor(@Inject(PURCHASE_ORDERS_REPOSITORY) private readonly purchaseOrdersRepository: PurchaseOrdersRepository) {}

  async execute(organizationId: string, storeId: string, purchaseOrderId: string): Promise<PurchaseOrderWithDetails> {
    const purchaseOrder = await this.purchaseOrdersRepository.findById(organizationId, storeId, purchaseOrderId);
    if (!purchaseOrder) {
      throw new NotFoundError("Purchase order not found");
    }
    if (purchaseOrder.status !== "ORDERED") {
      throw new ValidationError("Only ordered purchase orders can be cancelled");
    }

    return this.purchaseOrdersRepository.updateStatus(purchaseOrder.id, "CANCELLED");
  }
}
