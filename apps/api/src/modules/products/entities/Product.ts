import type { Category } from "../../categories/entities/Category.js";

export interface Product {
  id: string;
  organizationId: string;
  categoryId: string | null;
  sku: string;
  name: string;
  description: string | null;
  barcode: string | null;
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface CreateProductInput {
  organizationId: string;
  categoryId?: string | null;
  sku: string;
  name: string;
  description?: string | null;
  barcode?: string | null;
  priceCents: number;
}

export interface UpdateProductInput {
  categoryId?: string | null;
  sku?: string;
  name?: string;
  description?: string | null;
  barcode?: string | null;
  priceCents?: number;
}
