import type { SaleResponse } from "@pos/shared";
import type { SaleWithLineItems } from "../entities/Sale.js";

export function toSaleResponse(sale: SaleWithLineItems): SaleResponse {
  return {
    id: sale.id,
    storeId: sale.storeId,
    customerId: sale.customerId,
    customerName: sale.customerName,
    paymentMethod: sale.paymentMethod,
    paymentReference: sale.paymentReference,
    subtotalCents: sale.subtotalCents,
    discountCode: sale.discountCode,
    discountCents: sale.discountCents,
    totalCents: sale.totalCents,
    createdAt: sale.createdAt.toISOString(),
    lineItems: sale.lineItems.map((lineItem) => ({
      id: lineItem.id,
      productId: lineItem.productId,
      productName: lineItem.productName,
      quantity: lineItem.quantity,
      unitPriceCents: lineItem.unitPriceCents,
      lineTotalCents: lineItem.lineTotalCents,
    })),
  };
}
