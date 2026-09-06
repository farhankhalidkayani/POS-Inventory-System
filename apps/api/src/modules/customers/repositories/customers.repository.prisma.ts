import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateCustomerInput, Customer } from "../entities/Customer.js";
import type { CustomersRepository } from "./customers.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaCustomersRepository implements CustomersRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateCustomerInput): Promise<Customer> {
    return this.client.customer.create({
      data: {
        organizationId: input.organizationId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
    });
  }

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    return this.client.customer.findFirst({ where: { id, organizationId } });
  }

  async listByOrganization(organizationId: string): Promise<Customer[]> {
    return this.client.customer.findMany({ where: { organizationId }, orderBy: { lastName: "asc" } });
  }
}
