import { describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";
import type { Organization } from "../../organizations/entities/Organization.js";
import type { OrganizationsRepository } from "../../organizations/repositories/organizations.repository.js";
import { ReviewOrganizationUseCase } from "./ReviewOrganization.usecase.js";

function makeOrganization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: "org-1",
    name: "Acme",
    slug: "acme",
    status: "APPROVED",
    approvedAt: null,
    rejectedAt: null,
    suspendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepository(organization: Organization | null): OrganizationsRepository {
  return {
    create: vi.fn(),
    findById: vi.fn().mockResolvedValue(organization),
    findBySlug: vi.fn(),
    listByStatus: vi.fn(),
    listAll: vi.fn(),
    updateStatus: vi.fn().mockImplementation((id, status) => Promise.resolve(makeOrganization({ id, status }))),
  };
}

describe("ReviewOrganizationUseCase.suspend", () => {
  it("suspends an approved organization", async () => {
    const repository = makeRepository(makeOrganization({ status: "APPROVED" }));
    const useCase = new ReviewOrganizationUseCase(repository);

    const result = await useCase.suspend("org-1");

    expect(result.status).toBe("SUSPENDED");
    expect(repository.updateStatus).toHaveBeenCalledWith("org-1", "SUSPENDED");
  });

  it("rejects suspending an organization that isn't approved", async () => {
    const repository = makeRepository(makeOrganization({ status: "PENDING" }));
    const useCase = new ReviewOrganizationUseCase(repository);

    await expect(useCase.suspend("org-1")).rejects.toThrow(ConflictError);
  });

  it("throws when the organization doesn't exist", async () => {
    const repository = makeRepository(null);
    const useCase = new ReviewOrganizationUseCase(repository);

    await expect(useCase.suspend("missing")).rejects.toThrow(NotFoundError);
  });
});

describe("ReviewOrganizationUseCase.approve", () => {
  it("reactivates a suspended organization", async () => {
    const repository = makeRepository(makeOrganization({ status: "SUSPENDED" }));
    const useCase = new ReviewOrganizationUseCase(repository);

    const result = await useCase.approve("org-1");

    expect(result.status).toBe("APPROVED");
  });
});
