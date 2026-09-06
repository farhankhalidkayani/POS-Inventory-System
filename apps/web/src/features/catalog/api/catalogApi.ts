import type {
  CategoryResponse,
  CreateCategoryRequest,
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const catalogApi = {
  listCategories(accessToken: string): Promise<CategoryResponse[]> {
    return apiFetch<CategoryResponse[]>("/api/categories", { accessToken });
  },

  createCategory(accessToken: string, input: CreateCategoryRequest): Promise<CategoryResponse> {
    return apiFetch<CategoryResponse>("/api/categories", { method: "POST", accessToken, body: input });
  },

  listProducts(accessToken: string): Promise<ProductResponse[]> {
    return apiFetch<ProductResponse[]>("/api/products", { accessToken });
  },

  createProduct(accessToken: string, input: CreateProductRequest): Promise<ProductResponse> {
    return apiFetch<ProductResponse>("/api/products", { method: "POST", accessToken, body: input });
  },

  updateProduct(accessToken: string, productId: string, input: UpdateProductRequest): Promise<ProductResponse> {
    return apiFetch<ProductResponse>(`/api/products/${productId}`, { method: "PATCH", accessToken, body: input });
  },

  deleteProduct(accessToken: string, productId: string): Promise<void> {
    return apiFetch<void>(`/api/products/${productId}`, { method: "DELETE", accessToken });
  },

  findProductByBarcode(accessToken: string, barcode: string): Promise<ProductResponse> {
    return apiFetch<ProductResponse>(`/api/products/barcode/${encodeURIComponent(barcode)}`, { accessToken });
  },
};
