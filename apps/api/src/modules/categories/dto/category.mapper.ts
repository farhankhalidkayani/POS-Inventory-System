import type { CategoryResponse } from "@pos/shared";
import type { Category } from "../entities/Category.js";

export function toCategoryResponse(category: Category): CategoryResponse {
  return { id: category.id, name: category.name };
}
