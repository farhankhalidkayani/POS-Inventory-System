import type { RegisterOrganizationRequest } from "@pos/shared";
import { ConflictError } from "../../../shared/errors/AppError.js";
import { slugify } from "../../../shared/utils/slugify.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { Store } from "../../stores/entities/Store.js";
import type { User } from "../../users/entities/User.js";
import type { AuthUnitOfWork } from "../services/AuthUnitOfWork.js";
import type { PasswordService } from "../services/PasswordService.js";
import type { TokenService } from "../services/TokenService.js";

export interface RegisterOrganizationOwnerResult {
  organization: Organization;
  store: Store;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class RegisterOrganizationOwnerUseCase {
  constructor(
    private readonly unitOfWork: AuthUnitOfWork,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterOrganizationRequest): Promise<RegisterOrganizationOwnerResult> {
    const passwordHash = await this.passwordService.hash(input.ownerPassword);
    const baseSlug = slugify(input.organizationName);

    const { organization, store, user } = await this.unitOfWork.runInTransaction(async (repos) => {
      const existingUser = await repos.users.findByEmail(input.ownerEmail);
      if (existingUser) {
        throw new ConflictError("An account with this email already exists");
      }

      const slug = await this.resolveUniqueSlug(baseSlug, repos.organizations.findBySlug.bind(repos.organizations));

      const organization = await repos.organizations.create({ name: input.organizationName, slug });
      const store = await repos.stores.create({ organizationId: organization.id, name: input.storeName });
      const user = await repos.users.create({
        organizationId: organization.id,
        email: input.ownerEmail,
        passwordHash,
        firstName: input.ownerFirstName,
        lastName: input.ownerLastName,
        role: "OWNER",
      });

      return { organization, store, user };
    });

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
    });
    const refreshToken = this.tokenService.signRefreshToken({
      userId: user.id,
      organizationId: organization.id,
    });

    return { organization, store, user, accessToken, refreshToken };
  }

  private async resolveUniqueSlug(
    baseSlug: string,
    findBySlug: (slug: string) => Promise<{ id: string } | null>
  ): Promise<string> {
    let candidate = baseSlug;
    let suffix = 1;
    while (await findBySlug(candidate)) {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
    }
    return candidate;
  }
}
