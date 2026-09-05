import { describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../../shared/errors/AppError.js";
import type { AuthUnitOfWork, AuthUnitOfWorkRepositories } from "../services/AuthUnitOfWork.js";
import { RegisterOrganizationOwnerUseCase } from "./RegisterOrganizationOwner.usecase.js";

const VALID_INPUT = {
  organizationName: "Acme Retail",
  storeName: "Main Street",
  ownerFirstName: "Ada",
  ownerLastName: "Lovelace",
  ownerEmail: "ada@example.com",
  ownerPassword: "supersecret123",
};

function buildRepositories(overrides: Partial<AuthUnitOfWorkRepositories> = {}): AuthUnitOfWorkRepositories {
  return {
    organizations: {
      findBySlug: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "org_1",
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    },
    stores: {
      create: vi.fn().mockImplementation(async (input) => ({
        id: "store_1",
        ...input,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findById: vi.fn(),
      findFirstByOrganization: vi.fn(),
    },
    users: {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "user_1",
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findById: vi.fn(),
    },
    ...overrides,
  } as AuthUnitOfWorkRepositories;
}

function buildUnitOfWork(repositories: AuthUnitOfWorkRepositories): AuthUnitOfWork {
  return {
    runInTransaction: vi.fn().mockImplementation((work) => work(repositories)),
  };
}

describe("RegisterOrganizationOwnerUseCase", () => {
  it("creates an organization, store and owner user, returning tokens", async () => {
    const repositories = buildRepositories();
    const unitOfWork = buildUnitOfWork(repositories);
    const passwordService = { hash: vi.fn().mockResolvedValue("hashed-password"), verify: vi.fn() };
    const tokenService = {
      signAccessToken: vi.fn().mockReturnValue("access-token"),
      signRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    };

    const useCase = new RegisterOrganizationOwnerUseCase(unitOfWork, passwordService as never, tokenService as never);

    const result = await useCase.execute(VALID_INPUT);

    expect(repositories.organizations.create).toHaveBeenCalledWith({
      name: VALID_INPUT.organizationName,
      slug: "acme-retail",
    });
    expect(repositories.users.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "OWNER", passwordHash: "hashed-password" })
    );
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
  });

  it("throws ConflictError when the owner email is already registered", async () => {
    const repositories = buildRepositories({
      users: {
        findByEmail: vi.fn().mockResolvedValue({ id: "existing_user" }),
        create: vi.fn(),
        findById: vi.fn(),
      } as never,
    });
    const unitOfWork = buildUnitOfWork(repositories);
    const passwordService = { hash: vi.fn().mockResolvedValue("hashed-password"), verify: vi.fn() };
    const tokenService = { signAccessToken: vi.fn(), signRefreshToken: vi.fn() };

    const useCase = new RegisterOrganizationOwnerUseCase(unitOfWork, passwordService as never, tokenService as never);

    await expect(useCase.execute(VALID_INPUT)).rejects.toBeInstanceOf(ConflictError);
  });

  it("appends a numeric suffix when the organization slug is already taken", async () => {
    const repositories = buildRepositories({
      organizations: {
        findBySlug: vi
          .fn()
          .mockResolvedValueOnce({ id: "org_existing" })
          .mockResolvedValueOnce(null),
        findById: vi.fn(),
        create: vi.fn().mockImplementation(async (input) => ({
          id: "org_2",
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      } as never,
    });
    const unitOfWork = buildUnitOfWork(repositories);
    const passwordService = { hash: vi.fn().mockResolvedValue("hashed-password"), verify: vi.fn() };
    const tokenService = {
      signAccessToken: vi.fn().mockReturnValue("access-token"),
      signRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    };

    const useCase = new RegisterOrganizationOwnerUseCase(unitOfWork, passwordService as never, tokenService as never);

    await useCase.execute(VALID_INPUT);

    expect(repositories.organizations.create).toHaveBeenCalledWith({
      name: VALID_INPUT.organizationName,
      slug: "acme-retail-2",
    });
  });
});
