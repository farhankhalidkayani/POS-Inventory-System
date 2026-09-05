import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { PRODUCTS_REPOSITORY } from "../../shared/di/tokens.js";
import { CategoriesModule } from "../categories/categories.module.js";
import { PrismaProductsRepository } from "./repositories/products.repository.prisma.js";
import { CreateProductUseCase } from "./usecases/CreateProduct.usecase.js";
import { ListProductsUseCase } from "./usecases/ListProducts.usecase.js";
import { UpdateProductUseCase } from "./usecases/UpdateProduct.usecase.js";
import { DeleteProductUseCase } from "./usecases/DeleteProduct.usecase.js";
import { ProductsController } from "./products.controller.js";

@Module({
  imports: [CategoriesModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCTS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaProductsRepository(prisma),
      inject: [PrismaService],
    },
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [PRODUCTS_REPOSITORY],
})
export class ProductsModule {}
