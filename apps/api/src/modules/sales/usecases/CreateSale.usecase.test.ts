import { describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import type { SalesUnitOfWork, SalesUnitOfWorkRepositories } from "../services/SalesUnitOfWork.js";
import { CreateSaleUseCase } from "./CreateSale.usecase.js";

const STORE = {
  id: "store_1",
  organizationId: "org_1",
  name: "Main Street",
  address: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildProduct(overrides: Partial<{ id: string; name: string; priceCents: number }> = {}) {
  return {
    id: overrides.id ?? "product_1",
    organizationId: "org_1",
    categoryId: null,
    sku: "SKU-1",
    name: overrides.name ?? "Widget",
    description: null,
    barcode: null,
    priceCents: overrides.priceCents ?? 500,
    category: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function buildRepositories(inventoryQuantity: number): SalesUnitOfWorkRepositories {
  return {
    sales: {
      create: vi.fn().mockImplementation(async (input) => ({
        id: "sale_1",
        organizationId: input.organizationId,
        storeId: input.storeId,
        userId: input.userId,
        paymentMethod: input.paymentMethod,
        totalCents: input.totalCents,
        createdAt: new Date(),
        lineItems: input.lineItems.map((li: unknown, index: number) => ({
          id: `line_${index}`,
          saleId: "sale_1",
          productName: "Widget",
          ...(li as object),
        })),
      })),
      findById: vi.fn(),
      listByStore: vi.fn(),
    },
    products: {
      findById: vi.fn().mockResolvedValue(buildProduct()),
      findBySku: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    inventoryItems: {
      findByStoreAndProduct: vi.fn().mockResolvedValue({
        id: "inv_1",
        organizationId: "org_1",
        storeId: "store_1",
        productId: "product_1",
        quantity: inventoryQuantity,
        reorderThreshold: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      setQuantity: vi.fn().mockImplementation(async (organizationId, storeId, productId, quantity) => ({
        id: "inv_1",
        organizationId,
        storeId,
        productId,
        quantity,
        reorderThreshold: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listByStore: vi.fn(),
    },
    stockMovements: {
      create: vi.fn().mockImplementation(async (input) => ({ id: "movement_1", ...input, createdAt: new Date() })),
    },
  };
}

function buildUseCase(repositories: SalesUnitOfWorkRepositories, storeExists = true) {
  const unitOfWork: SalesUnitOfWork = {
    runInTransaction: vi.fn().mockImplementation((work) => work(repositories)),
  };
  const storesRepository = { findById: vi.fn().mockResolvedValue(storeExists ? STORE : null) };

  return new CreateSaleUseCase(unitOfWork, storesRepository as never);
}

describe("CreateSaleUseCase", () => {
  it("throws NotFoundError when the store does not exist", async () => {
    const useCase = buildUseCase(buildRepositories(10), false);
    await expect(
      useCase.execute("org_1", "store_1", "user_1", {
        paymentMethod: "CASH",
        lineItems: [{ productId: "product_1", quantity: 1 }],
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws ValidationError when requested quantity exceeds available stock", async () => {
    const useCase = buildUseCase(buildRepositories(2));
    await expect(
      useCase.execute("org_1", "store_1", "user_1", {
        paymentMethod: "CASH",
        lineItems: [{ productId: "product_1", quantity: 5 }],
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("decrements stock, records a SALE movement, and computes the total from current product price", async () => {
    const repositories = buildRepositories(10);
    const useCase = buildUseCase(repositories);

    const sale = await useCase.execute("org_1", "store_1", "user_1", {
      paymentMethod: "CARD",
      lineItems: [{ productId: "product_1", quantity: 3 }],
    });

    expect(repositories.inventoryItems.setQuantity).toHaveBeenCalledWith("org_1", "store_1", "product_1", 7);
    expect(repositories.stockMovements.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SALE", quantityChange: -3 })
    );
    expect(sale.totalCents).toBe(1500);
  });

  it("throws NotFoundError when a line item references a product that does not exist", async () => {
    const repositories = buildRepositories(10);
    repositories.products.findById = vi.fn().mockResolvedValue(null);
    const useCase = buildUseCase(repositories);

    await expect(
      useCase.execute("org_1", "store_1", "user_1", {
        paymentMethod: "CASH",
        lineItems: [{ productId: "missing", quantity: 1 }],
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
