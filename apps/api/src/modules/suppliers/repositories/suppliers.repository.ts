import type { CreateSupplierInput, Supplier } from "../entities/Supplier.js";

export interface SuppliersRepository {
  create(input: CreateSupplierInput): Promise<Supplier>;
  findById(organizationId: string, id: string): Promise<Supplier | null>;
  listByOrganization(organizationId: string): Promise<Supplier[]>;
}
