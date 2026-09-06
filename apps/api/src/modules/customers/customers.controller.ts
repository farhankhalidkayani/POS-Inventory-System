import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { createCustomerRequestSchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { CurrentAuth } from "../../shared/security/currentAuth.decorator.js";
import type { AuthContext } from "../../shared/security/authContext.js";
import { CreateCustomerUseCase } from "./usecases/CreateCustomer.usecase.js";
import { ListCustomersUseCase } from "./usecases/ListCustomers.usecase.js";
import { toCustomerResponse } from "./dto/customer.mapper.js";

@Controller("api/customers")
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly listCustomers: ListCustomersUseCase
  ) {}

  @Get()
  async list(@CurrentAuth() auth: AuthContext) {
    const customers = await this.listCustomers.execute(auth.organizationId);
    return customers.map(toCustomerResponse);
  }

  @Post()
  async create(@Body() body: unknown, @CurrentAuth() auth: AuthContext) {
    const input = createCustomerRequestSchema.parse(body);
    const customer = await this.createCustomer.execute(auth.organizationId, input);
    return toCustomerResponse(customer);
  }
}
