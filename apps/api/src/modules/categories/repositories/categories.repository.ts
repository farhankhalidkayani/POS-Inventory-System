import type { Category, CreateCategoryInput } from "../entities/Category.js";

export interface CategoriesRepository {
  create(input: CreateCategoryInput): Promise<Category>;
  findById(organizationId: string, id: string): Promise<Category | null>;
  findByName(organizationId: string, name: string): Promise<Category | null>;
  listByOrganization(organizationId: string): Promise<Category[]>;
}
