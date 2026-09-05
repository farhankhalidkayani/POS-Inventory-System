import type { InventoryRepository } from "../../inventory/repositories/inventory.repository.js";
import type { StockMovementsRepository } from "../../inventory/repositories/stockMovements.repository.js";
import type { ProductsRepository } from "../../products/repositories/products.repository.js";
import type { SalesRepository } from "../repositories/sales.repository.js";

export interface SalesUnitOfWorkRepositories {
  sales: SalesRepository;
  products: ProductsRepository;
  inventoryItems: InventoryRepository;
  stockMovements: StockMovementsRepository;
}

export interface SalesUnitOfWork {
  runInTransaction<T>(work: (repositories: SalesUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
