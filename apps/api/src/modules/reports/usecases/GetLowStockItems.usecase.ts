import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { INVENTORY_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { InventoryItemWithProduct } from "../../inventory/entities/InventoryItem.js";
import type { InventoryRepository } from "../../inventory/repositories/inventory.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";

@Injectable()
export class GetLowStockItemsUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly inventoryRepository: InventoryRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string): Promise<InventoryItemWithProduct[]> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const items = await this.inventoryRepository.listByStore(organizationId, storeId);
    return items.filter((item) => item.quantity <= item.reorderThreshold);
  }
}
