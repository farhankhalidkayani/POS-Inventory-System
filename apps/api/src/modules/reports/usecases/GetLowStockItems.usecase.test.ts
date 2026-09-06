import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { GetLowStockItemsUseCase } from "./GetLowStockItems.usecase.js";

const STORE = {
  id: "store_1",
  organizationId: "org_1",
  name: "Main Street",
  address: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildInventoryItem(overrides: { quantity: number; reorderThreshold: number; productId: string }) {
  return {
    id: `inv_${overrides.productId}`,
    organizationId: "org_1",
    storeId: "store_1",
    productId: overrides.productId,
    quantity: overrides.quantity,
    reorderThreshold: overrides.reorderThreshold,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: overrides.productId,
      organizationId: "org_1",
      categoryId: null,
      sku: `SKU-${overrides.productId}`,
      name: `Product ${overrides.productId}`,
      description: null,
      barcode: null,
      priceCents: 100,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

describe("GetLowStockItemsUseCase", () => {
  it("throws NotFoundError when the store does not exist", async () => {
    const inventoryRepository = { listByStore: vi.fn(), findByStoreAndProduct: vi.fn(), setQuantity: vi.fn() };
    const storesRepository = { findById: vi.fn().mockResolvedValue(null) };
    const useCase = new GetLowStockItemsUseCase(inventoryRepository as never, storesRepository as never);

    await expect(useCase.execute("org_1", "store_1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("only returns items at or below their reorder threshold", async () => {
    const items = [
      buildInventoryItem({ productId: "low", quantity: 2, reorderThreshold: 5 }),
      buildInventoryItem({ productId: "ok", quantity: 20, reorderThreshold: 5 }),
      buildInventoryItem({ productId: "exact", quantity: 5, reorderThreshold: 5 }),
    ];
    const inventoryRepository = {
      listByStore: vi.fn().mockResolvedValue(items),
      findByStoreAndProduct: vi.fn(),
      setQuantity: vi.fn(),
    };
    const storesRepository = { findById: vi.fn().mockResolvedValue(STORE) };
    const useCase = new GetLowStockItemsUseCase(inventoryRepository as never, storesRepository as never);

    const result = await useCase.execute("org_1", "store_1");

    expect(result.map((item) => item.productId)).toEqual(["low", "exact"]);
  });
});
