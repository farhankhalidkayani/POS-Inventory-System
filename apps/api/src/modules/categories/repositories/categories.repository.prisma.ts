import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { Category, CreateCategoryInput } from "../entities/Category.js";
import type { CategoriesRepository } from "./categories.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.client.category.create({ data: input });
  }

  async findById(organizationId: string, id: string): Promise<Category | null> {
    return this.client.category.findFirst({ where: { id, organizationId } });
  }

  async findByName(organizationId: string, name: string): Promise<Category | null> {
    return this.client.category.findFirst({ where: { organizationId, name } });
  }

  async listByOrganization(organizationId: string): Promise<Category[]> {
    return this.client.category.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }
}
