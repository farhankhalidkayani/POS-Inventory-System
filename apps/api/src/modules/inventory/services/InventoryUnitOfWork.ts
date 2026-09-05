import type { InventoryRepository } from "../repositories/inventory.repository.js";
import type { StockMovementsRepository } from "../repositories/stockMovements.repository.js";

export interface InventoryUnitOfWorkRepositories {
  inventoryItems: InventoryRepository;
  stockMovements: StockMovementsRepository;
}

export interface InventoryUnitOfWork {
  runInTransaction<T>(work: (repositories: InventoryUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
