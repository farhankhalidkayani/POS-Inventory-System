import { Inject, Injectable } from "@nestjs/common";
import type { ReceivePurchaseOrderRequest } from "@pos/shared";
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

  async execute(
    organizationId: string,
    storeId: string,
    purchaseOrderId: string,
    input: ReceivePurchaseOrderRequest
  ): Promise<PurchaseOrderWithDetails> {
    const purchaseOrder = await this.purchaseOrdersRepository.findById(organizationId, storeId, purchaseOrderId);
    if (!purchaseOrder) {
      throw new NotFoundError("Purchase order not found");
    }
    if (purchaseOrder.status !== "ORDERED" && purchaseOrder.status !== "PARTIALLY_RECEIVED") {
      throw new ValidationError("Only ordered or partially received purchase orders can be received");
    }

    const lineItemsById = new Map(purchaseOrder.lineItems.map((lineItem) => [lineItem.id, lineItem]));

    for (const receipt of input.lineItems) {
      const lineItem = lineItemsById.get(receipt.lineItemId);
      if (!lineItem) {
        throw new NotFoundError(`Line item ${receipt.lineItemId} not found on this purchase order`);
      }
      const remaining = lineItem.quantityOrdered - lineItem.quantityReceived;
      if (receipt.quantityReceived > remaining) {
        throw new ValidationError(
          `Cannot receive ${receipt.quantityReceived} of ${lineItem.productName} — only ${remaining} remaining`
        );
      }
    }

    return this.unitOfWork.runInTransaction(async (repos) => {
      for (const receipt of input.lineItems) {
        const lineItem = lineItemsById.get(receipt.lineItemId);
        if (!lineItem) continue;

        const existingInventory = await repos.inventoryItems.findByStoreAndProduct(
          organizationId,
          storeId,
          lineItem.productId
        );
        const newQuantity = (existingInventory?.quantity ?? 0) + receipt.quantityReceived;

        await repos.inventoryItems.setQuantity(organizationId, storeId, lineItem.productId, newQuantity);
        await repos.stockMovements.create({
          organizationId,
          storeId,
          productId: lineItem.productId,
          type: "RECEIVE",
          quantityChange: receipt.quantityReceived,
          note: `Received from purchase order ${purchaseOrder.id}`,
        });
        await repos.purchaseOrders.markLineItemReceived(
          lineItem.id,
          lineItem.quantityReceived + receipt.quantityReceived
        );
      }

      const receivedByLineItemId = new Map(input.lineItems.map((receipt) => [receipt.lineItemId, receipt.quantityReceived]));
      const isFullyReceived = purchaseOrder.lineItems.every((lineItem) => {
        const justReceived = receivedByLineItemId.get(lineItem.id) ?? 0;
        return lineItem.quantityReceived + justReceived >= lineItem.quantityOrdered;
      });

      return repos.purchaseOrders.updateStatus(
        purchaseOrder.id,
        isFullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
        isFullyReceived ? new Date() : undefined
      );
    });
  }
}
