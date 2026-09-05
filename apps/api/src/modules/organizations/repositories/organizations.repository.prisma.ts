import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateOrganizationInput, Organization } from "../entities/Organization.js";
import type { OrganizationsRepository } from "./organizations.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaOrganizationsRepository implements OrganizationsRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateOrganizationInput): Promise<Organization> {
    return this.client.organization.create({ data: input });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.client.organization.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.client.organization.findUnique({ where: { slug } });
  }
}
