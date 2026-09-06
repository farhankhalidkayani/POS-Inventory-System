import type { PurchaseOrderStatus } from "@pos/shared";
import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreatePurchaseOrderInput, PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersRepository } from "./purchaseOrders.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

const WITH_DETAILS = {
  include: { supplier: true, lineItems: { include: { product: true } } },
} as const;

type RawPurchaseOrder = Prisma.PurchaseOrderGetPayload<typeof WITH_DETAILS>;

function toPurchaseOrderWithDetails(po: RawPurchaseOrder): PurchaseOrderWithDetails {
  return {
    id: po.id,
    organizationId: po.organizationId,
    storeId: po.storeId,
    supplierId: po.supplierId,
    supplierName: po.supplier.name,
    status: po.status,
    totalCostCents: po.totalCostCents,
    receivedAt: po.receivedAt,
    createdAt: po.createdAt,
    lineItems: po.lineItems.map((lineItem) => ({
      id: lineItem.id,
      purchaseOrderId: lineItem.purchaseOrderId,
      productId: lineItem.productId,
      productName: lineItem.product.name,
      quantityOrdered: lineItem.quantityOrdered,
      quantityReceived: lineItem.quantityReceived,
      unitCostCents: lineItem.unitCostCents,
    })),
  };
}

export class PrismaPurchaseOrdersRepository implements PurchaseOrdersRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreatePurchaseOrderInput): Promise<PurchaseOrderWithDetails> {
    const po = await this.client.purchaseOrder.create({
      data: {
        organizationId: input.organizationId,
        storeId: input.storeId,
        supplierId: input.supplierId,
        totalCostCents: input.totalCostCents,
        lineItems: {
          create: input.lineItems.map((lineItem) => ({
            productId: lineItem.productId,
            quantityOrdered: lineItem.quantityOrdered,
            unitCostCents: lineItem.unitCostCents,
          })),
        },
      },
      ...WITH_DETAILS,
    });
    return toPurchaseOrderWithDetails(po);
  }

  async findById(organizationId: string, storeId: string, id: string): Promise<PurchaseOrderWithDetails | null> {
    const po = await this.client.purchaseOrder.findFirst({
      where: { id, organizationId, storeId },
      ...WITH_DETAILS,
    });
    return po ? toPurchaseOrderWithDetails(po) : null;
  }

  async listByStore(organizationId: string, storeId: string): Promise<PurchaseOrderWithDetails[]> {
    const orders = await this.client.purchaseOrder.findMany({
      where: { organizationId, storeId },
      orderBy: { createdAt: "desc" },
      ...WITH_DETAILS,
    });
    return orders.map(toPurchaseOrderWithDetails);
  }

  async markLineItemReceived(lineItemId: string, quantityReceived: number): Promise<void> {
    await this.client.purchaseOrderLineItem.update({
      where: { id: lineItemId },
      data: { quantityReceived },
    });
  }

  async updateStatus(id: string, status: PurchaseOrderStatus, receivedAt?: Date): Promise<PurchaseOrderWithDetails> {
    const po = await this.client.purchaseOrder.update({
      where: { id },
      data: { status, receivedAt },
      ...WITH_DETAILS,
    });
    return toPurchaseOrderWithDetails(po);
  }
}
