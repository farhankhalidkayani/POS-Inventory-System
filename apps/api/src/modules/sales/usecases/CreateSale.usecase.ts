import { Inject, Injectable } from "@nestjs/common";
import type { CreateSaleRequest } from "@pos/shared";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import {
  CUSTOMERS_REPOSITORY,
  DISCOUNTS_REPOSITORY,
  PAYMENT_PROVIDER,
  SALES_UNIT_OF_WORK,
  STORES_REPOSITORY,
} from "../../../shared/di/tokens.js";
import type { CustomersRepository } from "../../customers/repositories/customers.repository.js";
import type { Discount } from "../../discounts/entities/Discount.js";
import type { DiscountsRepository } from "../../discounts/repositories/discounts.repository.js";
import type { PaymentProvider } from "../../payments/services/PaymentProvider.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { CreateSaleLineItemInput, SaleWithLineItems } from "../entities/Sale.js";
import type { SalesUnitOfWork } from "../services/SalesUnitOfWork.js";

@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject(SALES_UNIT_OF_WORK) private readonly unitOfWork: SalesUnitOfWork,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository,
    @Inject(CUSTOMERS_REPOSITORY) private readonly customersRepository: CustomersRepository,
    @Inject(DISCOUNTS_REPOSITORY) private readonly discountsRepository: DiscountsRepository,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider
  ) {}

  async execute(
    organizationId: string,
    storeId: string,
    userId: string,
    input: CreateSaleRequest
  ): Promise<SaleWithLineItems> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    if (input.customerId) {
      const customer = await this.customersRepository.findById(organizationId, input.customerId);
      if (!customer) {
        throw new NotFoundError("Customer not found");
      }
    }

    let discount: Discount | null = null;
    if (input.discountCode) {
      discount = await this.discountsRepository.findByCode(organizationId, input.discountCode);
      if (!discount || !discount.active) {
        throw new NotFoundError("Discount code not found");
      }
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

      const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
      const discountCents = discount ? this.computeDiscountCents(discount, subtotalCents) : 0;
      const totalCents = subtotalCents - discountCents;

      const charge = await this.paymentProvider.charge({
        amountCents: totalCents,
        method: input.paymentMethod,
        referenceId: `${storeId}-${Date.now()}`,
      });
      if (!charge.success) {
        throw new ValidationError("Payment was declined");
      }

      return repos.sales.create({
        organizationId,
        storeId,
        userId,
        customerId: input.customerId,
        discountId: discount?.id,
        paymentMethod: input.paymentMethod,
        paymentReference: charge.transactionId,
        subtotalCents,
        discountCents,
        totalCents,
        lineItems,
      });
    });
  }

  private computeDiscountCents(discount: Discount, subtotalCents: number): number {
    const rawDiscountCents =
      discount.type === "PERCENTAGE" ? Math.round((subtotalCents * discount.value) / 100) : discount.value;
    return Math.min(rawDiscountCents, subtotalCents);
  }
}
