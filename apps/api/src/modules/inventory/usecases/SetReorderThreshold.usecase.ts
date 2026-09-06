import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { INVENTORY_REPOSITORY, PRODUCTS_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { ProductsRepository } from "../../products/repositories/products.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { InventoryItem } from "../entities/InventoryItem.js";
import type { InventoryRepository } from "../repositories/inventory.repository.js";

@Injectable()
export class SetReorderThresholdUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly inventoryRepository: InventoryRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(
    organizationId: string,
    storeId: string,
    productId: string,
    reorderThreshold: number
  ): Promise<InventoryItem> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const product = await this.productsRepository.findById(organizationId, productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return this.inventoryRepository.setReorderThreshold(organizationId, storeId, productId, reorderThreshold);
  }
}
