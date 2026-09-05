import { Inject, Injectable } from "@nestjs/common";
import type { CreateSaleRequest } from "@pos/shared";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import { SALES_UNIT_OF_WORK, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { CreateSaleLineItemInput, SaleWithLineItems } from "../entities/Sale.js";
import type { SalesUnitOfWork } from "../services/SalesUnitOfWork.js";

@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject(SALES_UNIT_OF_WORK) private readonly unitOfWork: SalesUnitOfWork,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string, userId: string, input: CreateSaleRequest): Promise<SaleWithLineItems> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    return this.unitOfWork.runInTransaction(async (repos) => {
      const lineItems: CreateSaleLineItemInput[] = [];

      for (const requested of input.lineItems) {
        const product = await repos.products.findById(organizationId, requested.productId);
        if (!product) {
          throw new NotFoundError(`Product ${requested.productId} not found`);
        }

        const existingInventory = await repos.inventoryItems.findByStoreAndProduct(
          organizationId,
          storeId,
          requested.productId
        );
        const currentQuantity = existingInventory?.quantity ?? 0;

        if (currentQuantity < requested.quantity) {
          throw new ValidationError(`Insufficient stock for ${product.name}`);
        }

        await repos.inventoryItems.setQuantity(organizationId, storeId, requested.productId, currentQuantity - requested.quantity);
        await repos.stockMovements.create({
          organizationId,
          storeId,
          productId: requested.productId,
          type: "SALE",
          quantityChange: -requested.quantity,
        });

        const unitPriceCents = product.priceCents;
        lineItems.push({
          productId: requested.productId,
          quantity: requested.quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * requested.quantity,
        });
      }

      const totalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

      return repos.sales.create({
        organizationId,
        storeId,
        userId,
        paymentMethod: input.paymentMethod,
        totalCents,
        lineItems,
      });
    });
  }
}
