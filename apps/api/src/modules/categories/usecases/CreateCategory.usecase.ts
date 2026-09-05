import { Inject, Injectable } from "@nestjs/common";
import { ConflictError } from "../../../shared/errors/AppError.js";
import { CATEGORIES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { Category } from "../entities/Category.js";
import type { CategoriesRepository } from "../repositories/categories.repository.js";

export interface CreateCategoryUseCaseInput {
  organizationId: string;
  name: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: CategoriesRepository) {}

  async execute(input: CreateCategoryUseCaseInput): Promise<Category> {
    const existing = await this.categoriesRepository.findByName(input.organizationId, input.name);
    if (existing) {
      throw new ConflictError("A category with this name already exists");
    }

    return this.categoriesRepository.create(input);
  }
}
