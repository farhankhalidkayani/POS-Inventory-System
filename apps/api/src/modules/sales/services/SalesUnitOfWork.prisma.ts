import type { PrismaClient } from "../../../shared/db/prisma.js";
import { PrismaInventoryRepository } from "../../inventory/repositories/inventory.repository.prisma.js";
import { PrismaStockMovementsRepository } from "../../inventory/repositories/stockMovements.repository.prisma.js";
import { PrismaProductsRepository } from "../../products/repositories/products.repository.prisma.js";
import { PrismaSalesRepository } from "../repositories/sales.repository.prisma.js";
import type { SalesUnitOfWork, SalesUnitOfWorkRepositories } from "./SalesUnitOfWork.js";

export class PrismaSalesUnitOfWork implements SalesUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async runInTransaction<T>(work: (repositories: SalesUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work({
        sales: new PrismaSalesRepository(tx),
        products: new PrismaProductsRepository(tx),
        inventoryItems: new PrismaInventoryRepository(tx),
        stockMovements: new PrismaStockMovementsRepository(tx),
      })
    );
  }
}
