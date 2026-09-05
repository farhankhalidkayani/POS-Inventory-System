import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { PRODUCTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { ProductsRepository } from "../repositories/products.repository.js";

@Injectable()
export class DeleteProductUseCase {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository) {}

  async execute(organizationId: string, productId: string): Promise<void> {
    const existing = await this.productsRepository.findById(organizationId, productId);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    await this.productsRepository.delete(organizationId, productId);
  }
}
