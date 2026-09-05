import { Inject, Injectable } from "@nestjs/common";
import { CATEGORIES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Category } from "../entities/Category.js";
import type { CategoriesRepository } from "../repositories/categories.repository.js";

@Injectable()
export class ListCategoriesUseCase {
  constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: CategoriesRepository) {}

  async execute(organizationId: string): Promise<Category[]> {
    return this.categoriesRepository.listByOrganization(organizationId);
  }
}
