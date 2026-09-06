import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { PRODUCTS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { ProductWithCategory } from "../entities/Product.js";
import type { ProductsRepository } from "../repositories/products.repository.js";

@Injectable()
export class FindProductByBarcodeUseCase {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository) {}

  async execute(organizationId: string, barcode: string): Promise<ProductWithCategory> {
    const product = await this.productsRepository.findByBarcode(organizationId, barcode);
    if (!product) {
      throw new NotFoundError(`No product found with barcode ${barcode}`);
    }
    return product;
  }
}
