import type { CreateSaleInput, SaleWithLineItems } from "../entities/Sale.js";

export interface SalesRepository {
  create(input: CreateSaleInput): Promise<SaleWithLineItems>;
  findById(organizationId: string, storeId: string, id: string): Promise<SaleWithLineItems | null>;
  listByStore(organizationId: string, storeId: string): Promise<SaleWithLineItems[]>;
}
