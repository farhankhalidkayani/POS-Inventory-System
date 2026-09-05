import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { InventoryItem, InventoryItemWithProduct } from "../entities/InventoryItem.js";
import type { InventoryRepository } from "./inventory.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly client: Client) {}

  async findByStoreAndProduct(organizationId: string, storeId: string, productId: string): Promise<InventoryItem | null> {
    return this.client.inventoryItem.findFirst({ where: { organizationId, storeId, productId } });
  }

  async setQuantity(organizationId: string, storeId: string, productId: string, quantity: number): Promise<InventoryItem> {
    return this.client.inventoryItem.upsert({
      where: { storeId_productId: { storeId, productId } },
      create: { organizationId, storeId, productId, quantity },
      update: { quantity },
    });
  }

  async listByStore(organizationId: string, storeId: string): Promise<InventoryItemWithProduct[]> {
    return this.client.inventoryItem.findMany({
      where: { organizationId, storeId },
      include: { product: { include: { category: true } } },
      orderBy: { product: { name: "asc" } },
    });
  }
}
