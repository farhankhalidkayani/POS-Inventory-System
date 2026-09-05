import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { SALES_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { SaleWithLineItems } from "../entities/Sale.js";
import type { SalesRepository } from "../repositories/sales.repository.js";

@Injectable()
export class ListStoreSalesUseCase {
  constructor(
    @Inject(SALES_REPOSITORY) private readonly salesRepository: SalesRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string): Promise<SaleWithLineItems[]> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    return this.salesRepository.listByStore(organizationId, storeId);
  }
}
