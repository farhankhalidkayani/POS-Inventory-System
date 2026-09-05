import { PrismaClient } from "../../generated/prisma/index.js";

export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export type { PrismaClient };
export { Prisma } from "../../generated/prisma/index.js";
