import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../../shared/errors/AppError.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { User } from "../../users/entities/User.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";
import { LoginUserUseCase } from "./LoginUser.usecase.js";

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user_1",
    organizationId: "org_1",
    email: "owner@example.com",
    passwordHash: "hashed",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "OWNER",
    isPlatformAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("LoginUserUseCase", () => {
  it("throws UnauthorizedError when the user does not exist", async () => {
    const usersRepository: UsersRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      findById: vi.fn(),
      listByOrganization: vi.fn(),
    };
    const organizationsRepository = {} as OrganizationsRepository;
    const storesRepository = {} as StoresRepository;
    const passwordService = { verify: vi.fn(), hash: vi.fn() };
    const tokenService = { signAccessToken: vi.fn(), signRefreshToken: vi.fn() };

    const useCase = new LoginUserUseCase(
      usersRepository,
      organizationsRepository,
      storesRepository,
      passwordService as never,
      tokenService as never
    );

    await expect(useCase.execute({ email: "missing@example.com", password: "secret123" })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("throws UnauthorizedError when the password is invalid", async () => {
    const user = buildUser();
    const usersRepository: UsersRepository = {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
      findById: vi.fn(),
      listByOrganization: vi.fn(),
    };
    const organizationsRepository = {} as OrganizationsRepository;
    const storesRepository = {} as StoresRepository;
    const passwordService = { verify: vi.fn().mockResolvedValue(false), hash: vi.fn() };
    const tokenService = { signAccessToken: vi.fn(), signRefreshToken: vi.fn() };

    const useCase = new LoginUserUseCase(
      usersRepository,
      organizationsRepository,
      storesRepository,
      passwordService as never,
      tokenService as never
    );

    await expect(useCase.execute({ email: user.email, password: "wrong-password" })).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("returns a session with tokens on valid credentials", async () => {
    const user = buildUser();
    const organization = {
      id: "org_1",
      name: "Acme",
      slug: "acme",
      status: "APPROVED" as const,
      approvedAt: new Date(),
      rejectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const store = {
      id: "store_1",
      organizationId: "org_1",
      name: "Main Street",
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const usersRepository: UsersRepository = {
      findByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn(),
      findById: vi.fn(),
      listByOrganization: vi.fn(),
    };
    const organizationsRepository: OrganizationsRepository = {
      findById: vi.fn().mockResolvedValue(organization),
      findBySlug: vi.fn(),
      create: vi.fn(),
      listByStatus: vi.fn(),
      updateStatus: vi.fn(),
    };
    const storesRepository: StoresRepository = {
      findFirstByOrganization: vi.fn().mockResolvedValue(store),
      findById: vi.fn(),
      create: vi.fn(),
    };
    const passwordService = { verify: vi.fn().mockResolvedValue(true), hash: vi.fn() };
    const tokenService = {
      signAccessToken: vi.fn().mockReturnValue("access-token"),
      signRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    };

    const useCase = new LoginUserUseCase(
      usersRepository,
      organizationsRepository,
      storesRepository,
      passwordService as never,
      tokenService as never
    );

    const result = await useCase.execute({ email: user.email, password: "correct-password" });

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(result.organization).toEqual(organization);
    expect(result.store).toEqual(store);
  });
});
