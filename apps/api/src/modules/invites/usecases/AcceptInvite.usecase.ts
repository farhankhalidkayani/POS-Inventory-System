import { Inject, Injectable } from "@nestjs/common";
import type { AcceptInviteRequest } from "@pos/shared";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { INVITES_REPOSITORY, INVITES_UNIT_OF_WORK, ORGANIZATIONS_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import { PasswordService } from "../../auth/services/PasswordService.js";
import { TokenService } from "../../../shared/security/token.service.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { Store } from "../../stores/entities/Store.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { User } from "../../users/entities/User.js";
import type { InvitesRepository } from "../repositories/invites.repository.js";
import type { InvitesUnitOfWork } from "../services/InvitesUnitOfWork.js";

export interface AcceptInviteResult {
  organization: Organization;
  store: Store | null;
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AcceptInviteUseCase {
  constructor(
    @Inject(INVITES_REPOSITORY) private readonly invitesRepository: InvitesRepository,
    @Inject(INVITES_UNIT_OF_WORK) private readonly unitOfWork: InvitesUnitOfWork,
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: AcceptInviteRequest): Promise<AcceptInviteResult> {
    const invite = await this.invitesRepository.findByToken(input.token);
    if (!invite) {
      throw new NotFoundError("Invite not found");
    }
    if (invite.status !== "PENDING") {
      throw new ValidationError("This invite is no longer valid");
    }
    if (invite.expiresAt < new Date()) {
      throw new ValidationError("This invite has expired");
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const user = await this.unitOfWork.runInTransaction(async (repos) => {
      const existingUser = await repos.users.findByEmail(invite.email);
      if (existingUser) {
        throw new ValidationError("An account with this email already exists");
      }

      const createdUser = await repos.users.create({
        organizationId: invite.organizationId,
        email: invite.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: invite.role,
      });

      await repos.invites.updateStatus(invite.id, "ACCEPTED", new Date());

      return createdUser;
    });

    const organization = await this.organizationsRepository.findById(invite.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found");
    }
    const store = await this.storesRepository.findFirstByOrganization(invite.organizationId);

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
      organizationStatus: organization.status,
      isPlatformAdmin: user.isPlatformAdmin,
    });
    const refreshToken = this.tokenService.signRefreshToken({
      userId: user.id,
      organizationId: organization.id,
    });

    return { organization, store, user, accessToken, refreshToken };
  }
}
