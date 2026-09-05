import { Inject, Injectable } from "@nestjs/common";
import type { CreateProductRequest } from "@pos/shared";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";
import { CATEGORIES_REPOSITORY, PRODUCTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { CategoriesRepository } from "../../categories/repositories/categories.repository.js";
import type { ProductWithCategory } from "../entities/Product.js";
import type { ProductsRepository } from "../repositories/products.repository.js";

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository,
    @Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: CategoriesRepository
  ) {}

  async execute(organizationId: string, input: CreateProductRequest): Promise<ProductWithCategory> {
    const existingSku = await this.productsRepository.findBySku(organizationId, input.sku);
    if (existingSku) {
      throw new ConflictError("A product with this SKU already exists");
    }

    if (input.categoryId) {
      const category = await this.categoriesRepository.findById(organizationId, input.categoryId);
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    return this.productsRepository.create({ organizationId, ...input });
  }
}
