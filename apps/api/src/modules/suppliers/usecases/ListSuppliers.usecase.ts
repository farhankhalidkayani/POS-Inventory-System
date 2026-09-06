import { Inject, Injectable } from "@nestjs/common";
import { SUPPLIERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Supplier } from "../entities/Supplier.js";
import type { SuppliersRepository } from "../repositories/suppliers.repository.js";

@Injectable()
export class ListSuppliersUseCase {
  constructor(@Inject(SUPPLIERS_REPOSITORY) private readonly suppliersRepository: SuppliersRepository) {}

  async execute(organizationId: string): Promise<Supplier[]> {
    return this.suppliersRepository.listByOrganization(organizationId);
  }
}
