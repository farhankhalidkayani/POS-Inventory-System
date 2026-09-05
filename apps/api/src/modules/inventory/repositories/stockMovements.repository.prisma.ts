import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateStockMovementInput, StockMovement } from "../entities/StockMovement.js";
import type { StockMovementsRepository } from "./stockMovements.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaStockMovementsRepository implements StockMovementsRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateStockMovementInput): Promise<StockMovement> {
    return this.client.stockMovement.create({
      data: {
        organizationId: input.organizationId,
        storeId: input.storeId,
        productId: input.productId,
        type: input.type,
        quantityChange: input.quantityChange,
        note: input.note ?? null,
      },
    });
  }
}
