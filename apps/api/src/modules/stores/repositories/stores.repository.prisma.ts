import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateStoreInput, Store } from "../entities/Store.js";
import type { StoresRepository } from "./stores.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaStoresRepository implements StoresRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateStoreInput): Promise<Store> {
    return this.client.store.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        address: input.address ?? null,
      },
    });
  }

  async findById(organizationId: string, id: string): Promise<Store | null> {
    return this.client.store.findFirst({ where: { id, organizationId } });
  }

  async findFirstByOrganization(organizationId: string): Promise<Store | null> {
    return this.client.store.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });
  }
}
