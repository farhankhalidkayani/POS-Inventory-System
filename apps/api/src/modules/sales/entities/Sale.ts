import type { PaymentMethod } from "@pos/shared";

export interface Sale {
  id: string;
  organizationId: string;
  storeId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  totalCents: number;
  createdAt: Date;
}

export interface SaleLineItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface SaleLineItemWithProduct extends SaleLineItem {
  productName: string;
}

export interface SaleWithLineItems extends Sale {
  lineItems: SaleLineItemWithProduct[];
}

export interface CreateSaleLineItemInput {
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CreateSaleInput {
  organizationId: string;
  storeId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  totalCents: number;
  lineItems: CreateSaleLineItemInput[];
}
