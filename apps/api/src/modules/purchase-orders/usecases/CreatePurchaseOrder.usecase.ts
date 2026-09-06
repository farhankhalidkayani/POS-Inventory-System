import { Inject, Injectable } from "@nestjs/common";
import type { CreatePurchaseOrderRequest } from "@pos/shared";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import {
  PRODUCTS_REPOSITORY,
  PURCHASE_ORDERS_REPOSITORY,
  STORES_REPOSITORY,
  SUPPLIERS_REPOSITORY,
} from "../../../shared/di/tokens.js";
import type { ProductsRepository } from "../../products/repositories/products.repository.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { SuppliersRepository } from "../../suppliers/repositories/suppliers.repository.js";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersRepository } from "../repositories/purchaseOrders.repository.js";

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDERS_REPOSITORY) private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository,
    @Inject(SUPPLIERS_REPOSITORY) private readonly suppliersRepository: SuppliersRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository
  ) {}

  async execute(
    organizationId: string,
    storeId: string,
    input: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrderWithDetails> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const supplier = await this.suppliersRepository.findById(organizationId, input.supplierId);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    for (const lineItem of input.lineItems) {
      const product = await this.productsRepository.findById(organizationId, lineItem.productId);
      if (!product) {
        throw new NotFoundError(`Product ${lineItem.productId} not found`);
      }
    }

    const totalCostCents = input.lineItems.reduce(
      (sum, lineItem) => sum + lineItem.unitCostCents * lineItem.quantityOrdered,
      0
    );

    return this.purchaseOrdersRepository.create({
      organizationId,
      storeId,
      supplierId: input.supplierId,
      totalCostCents,
      lineItems: input.lineItems,
    });
  }
}
