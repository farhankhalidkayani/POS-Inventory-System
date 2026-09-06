import { describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import type { InventoryUnitOfWork, InventoryUnitOfWorkRepositories } from "../services/InventoryUnitOfWork.js";
import { AdjustStockUseCase } from "./AdjustStock.usecase.js";

const STORE = {
  id: "store_1",
  organizationId: "org_1",
  name: "Main Street",
  address: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const PRODUCT = {
  id: "product_1",
  organizationId: "org_1",
  categoryId: null,
  sku: "SKU-1",
  name: "Widget",
  description: null,
  barcode: null,
  priceCents: 1000,
  category: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildRepositories(existingQuantity: number | null): InventoryUnitOfWorkRepositories {
  return {
    inventoryItems: {
      findByStoreAndProduct: vi.fn().mockResolvedValue(
        existingQuantity === null
          ? null
          : {
              id: "inv_1",
              organizationId: "org_1",
              storeId: "store_1",
              productId: "product_1",
              quantity: existingQuantity,
              reorderThreshold: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
      ),
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
      setReorderThreshold: vi.fn(),
      listByStore: vi.fn(),
    },
    stockMovements: {
      create: vi.fn().mockImplementation(async (input) => ({
        id: "movement_1",
        ...input,
        createdAt: new Date(),
      })),
    },
  };
}

function buildUseCase(repositories: InventoryUnitOfWorkRepositories, storeExists = true, productExists = true) {
  const unitOfWork: InventoryUnitOfWork = {
    runInTransaction: vi.fn().mockImplementation((work) => work(repositories)),
  };
  const productsRepository = { findById: vi.fn().mockResolvedValue(productExists ? PRODUCT : null) };
  const storesRepository = { findById: vi.fn().mockResolvedValue(storeExists ? STORE : null) };

  return new AdjustStockUseCase(unitOfWork, productsRepository as never, storesRepository as never);
}

describe("AdjustStockUseCase", () => {
  it("throws NotFoundError when the store does not exist", async () => {
    const useCase = buildUseCase(buildRepositories(0), false);
    await expect(
      useCase.execute("org_1", "store_1", { productId: "product_1", type: "RECEIVE", quantityChange: 5 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError when the product does not exist", async () => {
    const useCase = buildUseCase(buildRepositories(0), true, false);
    await expect(
      useCase.execute("org_1", "store_1", { productId: "product_1", type: "RECEIVE", quantityChange: 5 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates an inventory row from zero when none exists yet", async () => {
    const repositories = buildRepositories(null);
    const useCase = buildUseCase(repositories);

    const result = await useCase.execute("org_1", "store_1", {
      productId: "product_1",
      type: "RECEIVE",
      quantityChange: 10,
    });

    expect(result.inventoryItem.quantity).toBe(10);
    expect(repositories.inventoryItems.setQuantity).toHaveBeenCalledWith("org_1", "store_1", "product_1", 10);
  });

  it("throws ValidationError when the adjustment would go negative", async () => {
    const useCase = buildUseCase(buildRepositories(3));
    await expect(
      useCase.execute("org_1", "store_1", { productId: "product_1", type: "SALE", quantityChange: -5 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("records a stock movement alongside the quantity change", async () => {
    const repositories = buildRepositories(10);
    const useCase = buildUseCase(repositories);

    const result = await useCase.execute("org_1", "store_1", {
      productId: "product_1",
      type: "SALE",
      quantityChange: -4,
      note: "sold at register",
    });

    expect(result.inventoryItem.quantity).toBe(6);
    expect(result.movement.quantityChange).toBe(-4);
    expect(repositories.stockMovements.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SALE", quantityChange: -4, note: "sold at register" })
    );
  });
});
