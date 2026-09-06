import type { PurchaseOrderStatus } from "@pos/shared";

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  storeId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalCostCents: number;
  receivedAt: Date | null;
  createdAt: Date;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCostCents: number;
}

export interface PurchaseOrderLineItemWithProduct extends PurchaseOrderLineItem {
  productName: string;
}

export interface PurchaseOrderWithDetails extends PurchaseOrder {
  supplierName: string;
  lineItems: PurchaseOrderLineItemWithProduct[];
}

export interface CreatePurchaseOrderLineItemInput {
  productId: string;
  quantityOrdered: number;
  unitCostCents: number;
}

export interface CreatePurchaseOrderInput {
  organizationId: string;
  storeId: string;
  supplierId: string;
  totalCostCents: number;
  lineItems: CreatePurchaseOrderLineItemInput[];
}
