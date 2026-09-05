import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateUserInput, User } from "../entities/User.js";
import type { UsersRepository } from "./users.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateUserInput): Promise<User> {
    return this.client.user.create({ data: input });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.client.user.findUnique({ where: { email } });
  }

  async findById(organizationId: string, id: string): Promise<User | null> {
    return this.client.user.findFirst({ where: { id, organizationId } });
  }
}
