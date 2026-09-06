import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateDiscountInput, Discount } from "../entities/Discount.js";
import type { DiscountsRepository } from "./discounts.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaDiscountsRepository implements DiscountsRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateDiscountInput): Promise<Discount> {
    return this.client.discount.create({
      data: { organizationId: input.organizationId, code: input.code, type: input.type, value: input.value },
    });
  }

  async findByCode(organizationId: string, code: string): Promise<Discount | null> {
    return this.client.discount.findFirst({ where: { organizationId, code } });
  }

  async listByOrganization(organizationId: string): Promise<Discount[]> {
    return this.client.discount.findMany({ where: { organizationId }, orderBy: { code: "asc" } });
  }
}
