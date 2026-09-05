import type { Role } from "@pos/shared";

export interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  organizationId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
}
