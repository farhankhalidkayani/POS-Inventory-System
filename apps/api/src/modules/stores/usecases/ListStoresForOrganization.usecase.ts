import { Inject, Injectable } from "@nestjs/common";
import { STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Store } from "../entities/Store.js";
import type { StoresRepository } from "../repositories/stores.repository.js";

@Injectable()
export class ListStoresForOrganizationUseCase {
  constructor(@Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository) {}

  async execute(organizationId: string): Promise<Store[]> {
    const store = await this.storesRepository.findFirstByOrganization(organizationId);
    return store ? [store] : [];
  }
}
