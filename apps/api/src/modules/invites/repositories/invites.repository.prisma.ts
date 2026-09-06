import type { InviteStatus } from "@pos/shared";
import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateInviteInput, Invite } from "../entities/Invite.js";
import type { InvitesRepository } from "./invites.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

export class PrismaInvitesRepository implements InvitesRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateInviteInput): Promise<Invite> {
    return this.client.invite.create({
      data: {
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
        token: input.token,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<Invite | null> {
    return this.client.invite.findUnique({ where: { token } });
  }

  async findPendingByEmail(organizationId: string, email: string): Promise<Invite | null> {
    return this.client.invite.findFirst({ where: { organizationId, email, status: "PENDING" } });
  }

  async findById(organizationId: string, id: string): Promise<Invite | null> {
    return this.client.invite.findFirst({ where: { id, organizationId } });
  }

  async listByOrganization(organizationId: string): Promise<Invite[]> {
    return this.client.invite.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } });
  }

  async updateStatus(id: string, status: InviteStatus, acceptedAt?: Date): Promise<Invite> {
    return this.client.invite.update({ where: { id }, data: { status, acceptedAt } });
  }
}
