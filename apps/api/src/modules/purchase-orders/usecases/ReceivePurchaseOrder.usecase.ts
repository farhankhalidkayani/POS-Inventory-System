import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { PURCHASE_ORDERS_REPOSITORY, PURCHASE_ORDERS_UNIT_OF_WORK } from "../../../shared/di/tokens.js";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.js";
import type { PurchaseOrdersUnitOfWork } from "../services/PurchaseOrdersUnitOfWork.js";

@Injectable()
export class ReceivePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDERS_REPOSITORY) private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    @Inject(PURCHASE_ORDERS_UNIT_OF_WORK) private readonly unitOfWork: PurchaseOrdersUnitOfWork
  ) {}

  async execute(organizationId: string, storeId: string, purchaseOrderId: string): Promise<PurchaseOrderWithDetails> {
    const purchaseOrder = await this.purchaseOrdersRepository.findById(organizationId, storeId, purchaseOrderId);
    if (!purchaseOrder) {
      throw new NotFoundError("Purchase order not found");
    }
    if (purchaseOrder.status !== "ORDERED") {
      throw new ValidationError("Only ordered purchase orders can be received");
    }

    return this.unitOfWork.runInTransaction(async (repos) => {
      for (const lineItem of purchaseOrder.lineItems) {
        const existingInventory = await repos.inventoryItems.findByStoreAndProduct(
          organizationId,
          storeId,
          lineItem.productId
        );
        const newQuantity = (existingInventory?.quantity ?? 0) + lineItem.quantityOrdered;

        await repos.inventoryItems.setQuantity(organizationId, storeId, lineItem.productId, newQuantity);
        await repos.stockMovements.create({
          organizationId,
          storeId,
          productId: lineItem.productId,
          type: "RECEIVE",
          quantityChange: lineItem.quantityOrdered,
          note: `Received from purchase order ${purchaseOrder.id}`,
        });
        await repos.purchaseOrders.markLineItemReceived(lineItem.id, lineItem.quantityOrdered);
      }

      return repos.purchaseOrders.updateStatus(purchaseOrder.id, "RECEIVED", new Date());
    });
  }
}
