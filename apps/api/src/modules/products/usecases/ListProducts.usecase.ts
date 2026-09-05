import { Inject, Injectable } from "@nestjs/common";
import { PRODUCTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { ProductWithCategory } from "../entities/Product.js";
import type { ProductsRepository } from "../repositories/products.repository.js";

@Injectable()
export class ListProductsUseCase {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository) {}

  async execute(organizationId: string): Promise<ProductWithCategory[]> {
    return this.productsRepository.list(organizationId);
  }
}
