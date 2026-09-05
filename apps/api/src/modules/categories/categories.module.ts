import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { CATEGORIES_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaCategoriesRepository } from "./repositories/categories.repository.prisma.js";
import { CreateCategoryUseCase } from "./usecases/CreateCategory.usecase.js";
import { ListCategoriesUseCase } from "./usecases/ListCategories.usecase.js";
import { CategoriesController } from "./categories.controller.js";

@Module({
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORIES_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaCategoriesRepository(prisma),
      inject: [PrismaService],
    },
    CreateCategoryUseCase,
    ListCategoriesUseCase,
  ],
  exports: [CATEGORIES_REPOSITORY],
})
export class CategoriesModule {}
