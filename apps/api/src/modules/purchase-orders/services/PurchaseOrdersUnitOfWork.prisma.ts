import type { PrismaClient } from "../../../shared/db/prisma.js";
import { PrismaInventoryRepository } from "../../inventory/repositories/inventory.repository.prisma.js";
import { PrismaStockMovementsRepository } from "../../inventory/repositories/stockMovements.repository.prisma.js";
import { PrismaPurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.prisma.js";
import type { PurchaseOrdersUnitOfWork, PurchaseOrdersUnitOfWorkRepositories } from "./PurchaseOrdersUnitOfWork.js";

export class PrismaPurchaseOrdersUnitOfWork implements PurchaseOrdersUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async runInTransaction<T>(work: (repositories: PurchaseOrdersUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        purchaseOrders: new PrismaPurchaseOrdersRepository(tx),
        inventoryItems: new PrismaInventoryRepository(tx),
        stockMovements: new PrismaStockMovementsRepository(tx),
      })
    );
  }
}
