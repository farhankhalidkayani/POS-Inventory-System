import { Inject, Injectable } from "@nestjs/common";
import { DISCOUNTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Discount } from "../entities/Discount.js";
import type { DiscountsRepository } from "../repositories/discounts.repository.js";

@Injectable()
export class ListDiscountsUseCase {
  constructor(@Inject(DISCOUNTS_REPOSITORY) private readonly discountsRepository: DiscountsRepository) {}

  async execute(organizationId: string): Promise<Discount[]> {
    return this.discountsRepository.listByOrganization(organizationId);
  }
}
