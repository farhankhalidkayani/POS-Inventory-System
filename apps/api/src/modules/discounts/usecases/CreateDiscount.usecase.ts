import { Inject, Injectable } from "@nestjs/common";
import type { CreateDiscountRequest } from "@pos/shared";
import { ConflictError } from "../../../shared/errors/AppError.js";
import { DISCOUNTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Discount } from "../entities/Discount.js";
import type { DiscountsRepository } from "../repositories/discounts.repository.js";

@Injectable()
export class CreateDiscountUseCase {
  constructor(@Inject(DISCOUNTS_REPOSITORY) private readonly discountsRepository: DiscountsRepository) {}

  async execute(organizationId: string, input: CreateDiscountRequest): Promise<Discount> {
    const existing = await this.discountsRepository.findByCode(organizationId, input.code);
    if (existing) {
      throw new ConflictError("A discount with this code already exists");
    }

    return this.discountsRepository.create({ organizationId, ...input });
  }
}
