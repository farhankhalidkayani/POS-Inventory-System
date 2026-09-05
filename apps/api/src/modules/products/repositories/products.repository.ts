import type { CreateProductInput, Product, ProductWithCategory, UpdateProductInput } from "../entities/Product.js";

export interface ProductsRepository {
  create(input: CreateProductInput): Promise<ProductWithCategory>;
  findById(organizationId: string, id: string): Promise<ProductWithCategory | null>;
  findBySku(organizationId: string, sku: string): Promise<Product | null>;
  list(organizationId: string): Promise<ProductWithCategory[]>;
  update(organizationId: string, id: string, input: UpdateProductInput): Promise<ProductWithCategory>;
  delete(organizationId: string, id: string): Promise<void>;
}
