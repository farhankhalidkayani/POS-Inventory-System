import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateSupplierInput, Supplier } from "../entities/Supplier.js";
import type { SuppliersRepository } from "./suppliers.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaSuppliersRepository implements SuppliersRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateSupplierInput): Promise<Supplier> {
    return this.client.supplier.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
      },
    });
  }

  async findById(organizationId: string, id: string): Promise<Supplier | null> {
    return this.client.supplier.findFirst({ where: { id, organizationId } });
  }

  async listByOrganization(organizationId: string): Promise<Supplier[]> {
    return this.client.supplier.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }
}
