import { Inject, Injectable } from "@nestjs/common";
import type { LoginRequest } from "@pos/shared";
import { UnauthorizedError } from "../../../shared/errors/AppError.js";
import { ORGANIZATIONS_REPOSITORY, STORES_REPOSITORY, USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { Store } from "../../stores/entities/Store.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { User } from "../../users/entities/User.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";
import { PasswordService } from "../services/PasswordService.js";
import { TokenService } from "../../../shared/security/token.service.js";

export interface LoginUserResult {
  organization: Organization;
  store: Store | null;
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    @Inject(ORGANIZATIONS_REPOSITORY) private readonly organizationsRepository: OrganizationsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginRequest): Promise<LoginUserResult> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await this.passwordService.verify(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const organization = await this.organizationsRepository.findById(user.organizationId);
    if (!organization) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const store = await this.storesRepository.findFirstByOrganization(organization.id);

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
