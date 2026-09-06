import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { CUSTOMERS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaCustomersRepository } from "./repositories/customers.repository.prisma.js";
import { CreateCustomerUseCase } from "./usecases/CreateCustomer.usecase.js";
import { ListCustomersUseCase } from "./usecases/ListCustomers.usecase.js";
import { CustomersController } from "./customers.controller.js";

@Module({
  controllers: [CustomersController],
  providers: [
    {
      provide: CUSTOMERS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaCustomersRepository(prisma),
      inject: [PrismaService],
    },
    CreateCustomerUseCase,
    ListCustomersUseCase,
  ],
  exports: [CUSTOMERS_REPOSITORY],
})
export class CustomersModule {}
