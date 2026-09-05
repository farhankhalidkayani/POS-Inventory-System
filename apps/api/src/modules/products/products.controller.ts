import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { createProductRequestSchema, updateProductRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateProductUseCase } from "./usecases/CreateProduct.usecase.js";
import { ListProductsUseCase } from "./usecases/ListProducts.usecase.js";
import { UpdateProductUseCase } from "./usecases/UpdateProduct.usecase.js";
import { DeleteProductUseCase } from "./usecases/DeleteProduct.usecase.js";
import { toProductResponse } from "./dto/product.mapper.js";

@Controller("api/products")
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase
  ) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const products = await this.listProducts.execute(auth.organizationId);
    return products.map(toProductResponse);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createProductRequestSchema.parse(body);
    const product = await this.createProduct.execute(auth.organizationId, input);
    return toProductResponse(product);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = updateProductRequestSchema.parse(body);
    const product = await this.updateProduct.execute(auth.organizationId, id, input);
    return toProductResponse(product);
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async remove(@Param("id") id: string, @CurrentAuth() auth: AuthContext) {
    await this.deleteProduct.execute(auth.organizationId, id);
  }
}
