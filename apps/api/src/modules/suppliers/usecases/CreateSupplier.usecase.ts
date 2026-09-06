import { Inject, Injectable } from "@nestjs/common";
import type { CreateSupplierRequest } from "@pos/shared";
import { SUPPLIERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Supplier } from "../entities/Supplier.js";
import type { SuppliersRepository } from "../repositories/suppliers.repository.js";

@Injectable()
export class CreateSupplierUseCase {
  constructor(@Inject(SUPPLIERS_REPOSITORY) private readonly suppliersRepository: SuppliersRepository) {}

  async execute(organizationId: string, input: CreateSupplierRequest): Promise<Supplier> {
    return this.suppliersRepository.create({ organizationId, ...input });
  }
}
