import { Prisma, type PrismaClient } from "../../../shared/db/prisma.js";
import { ConflictError } from "../../../shared/errors/AppError.js";
import type { CreateProductInput, Product, ProductWithCategory, UpdateProductInput } from "../entities/Product.js";
import type { ProductsRepository } from "./products.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

const WITH_CATEGORY = { include: { category: true } } as const;

export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateProductInput): Promise<ProductWithCategory> {
    return this.client.product.create({
      data: {
        organizationId: input.organizationId,
        categoryId: input.categoryId ?? null,
        sku: input.sku,
        name: input.name,
        description: input.description ?? null,
        barcode: input.barcode ?? null,
        priceCents: input.priceCents,
      },
      ...WITH_CATEGORY,
    });
  }

  async findById(organizationId: string, id: string): Promise<ProductWithCategory | null> {
    return this.client.product.findFirst({ where: { id, organizationId }, ...WITH_CATEGORY });
  }

  async findBySku(organizationId: string, sku: string): Promise<Product | null> {
    return this.client.product.findFirst({ where: { organizationId, sku } });
  }

  async list(organizationId: string): Promise<ProductWithCategory[]> {
    return this.client.product.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      ...WITH_CATEGORY,
    });
  }

  async update(organizationId: string, id: string, input: UpdateProductInput): Promise<ProductWithCategory> {
    await this.client.product.updateMany({ where: { id, organizationId }, data: input });
    const updated = await this.findById(organizationId, id);
    if (!updated) {
      throw new Error("Product disappeared during update");
    }
    return updated;
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      await this.client.product.deleteMany({ where: { id, organizationId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictError("Cannot delete a product that has inventory or stock movement history");
      }
      throw error;
    }
  }
}
