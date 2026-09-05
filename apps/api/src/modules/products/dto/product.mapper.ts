import type { ProductResponse } from "@pos/shared";
import { toCategoryResponse } from "../../categories/dto/category.mapper.js";
import type { ProductWithCategory } from "../entities/Product.js";

export function toProductResponse(product: ProductWithCategory): ProductResponse {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    barcode: product.barcode,
    priceCents: product.priceCents,
    category: product.category ? toCategoryResponse(product.category) : null,
  };
}
