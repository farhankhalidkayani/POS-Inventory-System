import type { InventoryRepository } from "../../inventory/repositories/inventory.repository.js";
import type { StockMovementsRepository } from "../../inventory/repositories/stockMovements.repository.js";
import type { PurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.js";

export interface PurchaseOrdersUnitOfWorkRepositories {
  purchaseOrders: PurchaseOrdersRepository;
  inventoryItems: InventoryRepository;
  stockMovements: StockMovementsRepository;
}

export interface PurchaseOrdersUnitOfWork {
  runInTransaction<T>(work: (repositories: PurchaseOrdersUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
