import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { INVENTORY_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { InventoryItemWithProduct } from "../entities/InventoryItem.js";
import type { InventoryRepository } from "../repositories/inventory.repository.js";

@Injectable()
export class GetStoreInventoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly inventoryRepository: InventoryRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string): Promise<InventoryItemWithProduct[]> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    return this.inventoryRepository.listByStore(organizationId, storeId);
  }
}
