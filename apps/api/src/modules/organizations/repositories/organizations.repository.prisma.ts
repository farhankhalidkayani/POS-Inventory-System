import type { OrganizationStatus } from "@pos/shared";
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

  async listByStatus(status: OrganizationStatus): Promise<Organization[]> {
    return this.client.organization.findMany({ where: { status }, orderBy: { createdAt: "asc" } });
  }

  async listAll(): Promise<Organization[]> {
    return this.client.organization.findMany({ orderBy: { createdAt: "asc" } });
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<Organization> {
    return this.client.organization.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : undefined,
        rejectedAt: status === "REJECTED" ? new Date() : undefined,
        suspendedAt: status === "SUSPENDED" ? new Date() : undefined,
      },
    });
  }
}
