import { randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import type { CreateInviteRequest, Role } from "@pos/shared";
import { ConflictError, ForbiddenError } from "../../../shared/errors/AppError.js";
import { INVITES_REPOSITORY, USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";
import type { Invite } from "../entities/Invite.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class CreateInviteUseCase {
  constructor(
    @Inject(INVITES_REPOSITORY) private readonly invitesRepository: InvitesRepository,
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository
  ) {}

  async execute(organizationId: string, inviterRole: Role, input: CreateInviteRequest): Promise<Invite> {
    if (input.role === "OWNER" && inviterRole !== "OWNER") {
      throw new ForbiddenError("Only an owner can invite another owner");
    }

    const existingUser = await this.usersRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    const existingInvite = await this.invitesRepository.findPendingByEmail(organizationId, input.email);
    if (existingInvite) {
      throw new ConflictError("An invite for this email is already pending");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    return this.invitesRepository.create({
      organizationId,
      email: input.email,
      role: input.role,
      token: randomBytes(32).toString("hex"),
      expiresAt,
    });
  }
}
