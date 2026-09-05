import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { createCategoryRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { RolesGuard } from "../../shared/security/roles.guard.js";
import { Roles } from "../../shared/security/roles.decorator.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateCategoryUseCase } from "./usecases/CreateCategory.usecase.js";
import { ListCategoriesUseCase } from "./usecases/ListCategories.usecase.js";
import { toCategoryResponse } from "./dto/category.mapper.js";

@Controller("api/categories")
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase
  ) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const categories = await this.listCategories.execute(auth.organizationId);
    return categories.map(toCategoryResponse);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("OWNER", "ADMIN", "MANAGER")
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createCategoryRequestSchema.parse(body);
    const category = await this.createCategory.execute({ organizationId: auth.organizationId, name: input.name });
    return toCategoryResponse(category);
  }
}
