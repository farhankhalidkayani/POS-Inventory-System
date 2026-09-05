import { Inject, Injectable } from "@nestjs/common";
import type { AdjustStockRequest } from "@pos/shared";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { INVENTORY_UNIT_OF_WORK, PRODUCTS_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { ProductsRepository } from "../../products/repositories/products.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { InventoryItem } from "../entities/InventoryItem.js";
import type { StockMovement } from "../entities/StockMovement.js";
import type { InventoryUnitOfWork } from "../services/InventoryUnitOfWork.js";

export interface AdjustStockResult {
  inventoryItem: InventoryItem;
  movement: StockMovement;
}

@Injectable()
export class AdjustStockUseCase {
  constructor(
    @Inject(INVENTORY_UNIT_OF_WORK) private readonly unitOfWork: InventoryUnitOfWork,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string, input: AdjustStockRequest): Promise<AdjustStockResult> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const product = await this.productsRepository.findById(organizationId, input.productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return this.unitOfWork.runInTransaction(async (repos) => {
      const existing = await repos.inventoryItems.findByStoreAndProduct(organizationId, storeId, input.productId);
      const currentQuantity = existing?.quantity ?? 0;
      const newQuantity = currentQuantity + input.quantityChange;

      if (newQuantity < 0) {
        throw new ValidationError("Adjustment would result in negative stock");
      }

      const inventoryItem = await repos.inventoryItems.setQuantity(organizationId, storeId, input.productId, newQuantity);
      const movement = await repos.stockMovements.create({
        organizationId,
        storeId,
        productId: input.productId,
        type: input.type,
        quantityChange: input.quantityChange,
        note: input.note,
      });

      return { inventoryItem, movement };
    });
  }
}
