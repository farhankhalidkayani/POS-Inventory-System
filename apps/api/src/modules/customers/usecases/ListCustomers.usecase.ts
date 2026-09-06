import { Inject, Injectable } from "@nestjs/common";
import { CUSTOMERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Customer } from "../entities/Customer.js";
import type { CustomersRepository } from "../repositories/customers.repository.js";

@Injectable()
export class ListCustomersUseCase {
  constructor(@Inject(CUSTOMERS_REPOSITORY) private readonly customersRepository: CustomersRepository) {}

  async execute(organizationId: string): Promise<Customer[]> {
    return this.customersRepository.listByOrganization(organizationId);
  }
}
