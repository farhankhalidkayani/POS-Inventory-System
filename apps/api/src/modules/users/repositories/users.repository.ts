import type { CreateUserInput, User } from "../entities/User.js";

export interface UsersRepository {
  create(input: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(organizationId: string, id: string): Promise<User | null>;
  listByOrganization(organizationId: string): Promise<User[]>;
}
