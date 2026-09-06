import { Inject, Injectable } from "@nestjs/common";
import type { CreateCustomerRequest } from "@pos/shared";
import { CUSTOMERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Customer } from "../entities/Customer.js";
import type { CustomersRepository } from "../repositories/customers.repository.js";

@Injectable()
export class CreateCustomerUseCase {
  constructor(@Inject(CUSTOMERS_REPOSITORY) private readonly customersRepository: CustomersRepository) {}

  async execute(organizationId: string, input: CreateCustomerRequest): Promise<Customer> {
    return this.customersRepository.create({ organizationId, ...input });
  }
}
