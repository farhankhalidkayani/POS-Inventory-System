import { describe, expect, it, vi } from "vitest";
import { ConflictError, ForbiddenError } from "../../../shared/errors/AppError.js";
import { CreateInviteUseCase } from "./CreateInvite.usecase.js";

function buildUseCase(options: { existingUser?: unknown; pendingInvite?: unknown } = {}) {
  const invitesRepository = {
    create: vi.fn().mockImplementation(async (input) => ({
      id: "invite_1",
      ...input,
      status: "PENDING",
      acceptedAt: null,
      createdAt: new Date(),
    })),
    findByToken: vi.fn(),
    findPendingByEmail: vi.fn().mockResolvedValue(options.pendingInvite ?? null),
    findById: vi.fn(),
    listByOrganization: vi.fn(),
    updateStatus: vi.fn(),
  };
  const usersRepository = {
    findByEmail: vi.fn().mockResolvedValue(options.existingUser ?? null),
    create: vi.fn(),
    findById: vi.fn(),
    listByOrganization: vi.fn(),
  };

  return { useCase: new CreateInviteUseCase(invitesRepository, usersRepository), invitesRepository };
}

describe("CreateInviteUseCase", () => {
  it("throws ForbiddenError when a non-owner tries to invite an owner", async () => {
    const { useCase } = buildUseCase();
    await expect(useCase.execute("org_1", "ADMIN", { email: "new@example.com", role: "OWNER" })).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });

  it("allows an owner to invite another owner", async () => {
    const { useCase, invitesRepository } = buildUseCase();
    await useCase.execute("org_1", "OWNER", { email: "new@example.com", role: "OWNER" });
    expect(invitesRepository.create).toHaveBeenCalledWith(expect.objectContaining({ role: "OWNER" }));
  });

  it("throws ConflictError when a user with the email already exists", async () => {
    const { useCase } = buildUseCase({ existingUser: { id: "existing" } });
    await expect(useCase.execute("org_1", "OWNER", { email: "taken@example.com", role: "CASHIER" })).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it("throws ConflictError when a pending invite for the email already exists", async () => {
    const { useCase } = buildUseCase({ pendingInvite: { id: "invite_existing" } });
    await expect(
      useCase.execute("org_1", "OWNER", { email: "pending@example.com", role: "CASHIER" })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("creates an invite with a random token and a 7-day expiry", async () => {
    const { useCase, invitesRepository } = buildUseCase();
    const before = Date.now();

    const invite = await useCase.execute("org_1", "OWNER", { email: "new@example.com", role: "CASHIER" });

    expect(invite.token).toMatch(/^[a-f0-9]{64}$/);
    const daysUntilExpiry = (invite.expiresAt.getTime() - before) / (1000 * 60 * 60 * 24);
    expect(daysUntilExpiry).toBeGreaterThan(6.9);
    expect(daysUntilExpiry).toBeLessThan(7.1);
    expect(invitesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org_1", email: "new@example.com", role: "CASHIER" })
    );
  });
});
