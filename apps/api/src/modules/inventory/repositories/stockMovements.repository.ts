import type { CreateStockMovementInput, StockMovement } from "../entities/StockMovement.js";

export interface StockMovementsRepository {
  create(input: CreateStockMovementInput): Promise<StockMovement>;
}
