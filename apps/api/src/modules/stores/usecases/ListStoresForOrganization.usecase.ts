import type { Store } from "../entities/Store.js";
import type { StoresRepository } from "../repositories/stores.repository.js";

export class ListStoresForOrganizationUseCase {
  constructor(private readonly storesRepository: StoresRepository) {}

  async execute(organizationId: string): Promise<Store[]> {
    const store = await this.storesRepository.findFirstByOrganization(organizationId);
    return store ? [store] : [];
  }
}
