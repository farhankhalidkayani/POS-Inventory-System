import { describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";
import { CreateProductUseCase } from "./CreateProduct.usecase.js";

const VALID_INPUT = {
  sku: "SKU-1",
  name: "Widget",
  priceCents: 1500,
};

describe("CreateProductUseCase", () => {
  it("throws ConflictError when the SKU is already taken", async () => {
    const productsRepository = {
      findBySku: vi.fn().mockResolvedValue({ id: "existing" }),
      findById: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const categoriesRepository = { findById: vi.fn(), findByName: vi.fn(), listByOrganization: vi.fn(), create: vi.fn() };

    const useCase = new CreateProductUseCase(productsRepository as never, categoriesRepository as never);

    await expect(useCase.execute("org_1", VALID_INPUT)).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws NotFoundError when the given category does not exist", async () => {
    const productsRepository = {
      findBySku: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const categoriesRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByName: vi.fn(),
      listByOrganization: vi.fn(),
      create: vi.fn(),
    };

    const useCase = new CreateProductUseCase(productsRepository as never, categoriesRepository as never);

    await expect(useCase.execute("org_1", { ...VALID_INPUT, categoryId: "missing" })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("creates the product when the SKU is free and category (if given) exists", async () => {
    const createdProduct = { id: "product_1", ...VALID_INPUT, category: null };
    const productsRepository = {
      findBySku: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(createdProduct),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const categoriesRepository = { findById: vi.fn(), findByName: vi.fn(), listByOrganization: vi.fn(), create: vi.fn() };

    const useCase = new CreateProductUseCase(productsRepository as never, categoriesRepository as never);

    const result = await useCase.execute("org_1", VALID_INPUT);

    expect(result).toEqual(createdProduct);
    expect(productsRepository.create).toHaveBeenCalledWith({ organizationId: "org_1", ...VALID_INPUT });
  });
});
