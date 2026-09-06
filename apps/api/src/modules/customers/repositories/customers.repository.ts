import type { CreateCustomerInput, Customer } from "../entities/Customer.js";

export interface CustomersRepository {
  create(input: CreateCustomerInput): Promise<Customer>;
  findById(organizationId: string, id: string): Promise<Customer | null>;
  listByOrganization(organizationId: string): Promise<Customer[]>;
}
