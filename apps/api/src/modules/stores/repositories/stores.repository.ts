import type { CreateStoreInput, Store } from "../entities/Store.js";

export interface StoresRepository {
  create(input: CreateStoreInput): Promise<Store>;
  findById(organizationId: string, id: string): Promise<Store | null>;
  findFirstByOrganization(organizationId: string): Promise<Store | null>;
}
