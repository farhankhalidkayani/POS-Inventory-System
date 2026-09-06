import type { CreateDiscountInput, Discount } from "../entities/Discount.js";

export interface DiscountsRepository {
  create(input: CreateDiscountInput): Promise<Discount>;
  findByCode(organizationId: string, code: string): Promise<Discount | null>;
  listByOrganization(organizationId: string): Promise<Discount[]>;
}
