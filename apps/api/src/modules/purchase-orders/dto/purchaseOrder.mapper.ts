import type { PurchaseOrderResponse } from "@pos/shared";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";

export function toPurchaseOrderResponse(purchaseOrder: PurchaseOrderWithDetails): PurchaseOrderResponse {
  return {
    id: purchaseOrder.id,
    storeId: purchaseOrder.storeId,
    supplierId: purchaseOrder.supplierId,
    supplierName: purchaseOrder.supplierName,
    status: purchaseOrder.status,
    totalCostCents: purchaseOrder.totalCostCents,
    receivedAt: purchaseOrder.receivedAt ? purchaseOrder.receivedAt.toISOString() : null,
    createdAt: purchaseOrder.createdAt.toISOString(),
    lineItems: purchaseOrder.lineItems.map((lineItem) => ({
      id: lineItem.id,
      productId: lineItem.productId,
      productName: lineItem.productName,
      quantityOrdered: lineItem.quantityOrdered,
      quantityReceived: lineItem.quantityReceived,
      unitCostCents: lineItem.unitCostCents,
    })),
  };
}
