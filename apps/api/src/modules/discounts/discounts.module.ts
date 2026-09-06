import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service.js";
import { DISCOUNTS_REPOSITORY } from "../../shared/di/tokens.js";
import { PrismaDiscountsRepository } from "./repositories/discounts.repository.prisma.js";
import { CreateDiscountUseCase } from "./usecases/CreateDiscount.usecase.js";
import { ListDiscountsUseCase } from "./usecases/ListDiscounts.usecase.js";
import { DiscountsController } from "./discounts.controller.js";

@Module({
  controllers: [DiscountsController],
  providers: [
    {
      provide: DISCOUNTS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaDiscountsRepository(prisma),
      inject: [PrismaService],
    },
    CreateDiscountUseCase,
    ListDiscountsUseCase,
  ],
  exports: [DISCOUNTS_REPOSITORY],
})
export class DiscountsModule {}
