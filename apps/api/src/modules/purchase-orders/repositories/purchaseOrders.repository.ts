import type { CreatePurchaseOrderInput, PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrderStatus } from "@pos/shared";

export interface PurchaseOrdersRepository {
  create(input: CreatePurchaseOrderInput): Promise<PurchaseOrderWithDetails>;
  findById(organizationId: string, storeId: string, id: string): Promise<PurchaseOrderWithDetails | null>;
  listByStore(organizationId: string, storeId: string): Promise<PurchaseOrderWithDetails[]>;
  markLineItemReceived(lineItemId: string, quantityReceived: number): Promise<void>;
  updateStatus(id: string, status: PurchaseOrderStatus, receivedAt?: Date): Promise<PurchaseOrderWithDetails>;
}
