import type { PrismaClient } from "../../../shared/db/prisma.js";
import { PrismaInventoryRepository } from "../repositories/inventory.repository.prisma.js";
import { PrismaStockMovementsRepository } from "../repositories/stockMovements.repository.prisma.js";
import type { InventoryUnitOfWork, InventoryUnitOfWorkRepositories } from "./InventoryUnitOfWork.js";

export class PrismaInventoryUnitOfWork implements InventoryUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async runInTransaction<T>(work: (repositories: InventoryUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        inventoryItems: new PrismaInventoryRepository(tx),
        stockMovements: new PrismaStockMovementsRepository(tx),
      })
    );
  }
}
