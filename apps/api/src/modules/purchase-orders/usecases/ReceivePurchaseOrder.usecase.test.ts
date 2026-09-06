import { describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError.js";
import type { PurchaseOrderWithDetails } from "../entities/PurchaseOrder.js";
import type { PurchaseOrdersUnitOfWork, PurchaseOrdersUnitOfWorkRepositories } from "../services/PurchaseOrdersUnitOfWork.js";
import { ReceivePurchaseOrderUseCase } from "./ReceivePurchaseOrder.usecase.js";

function buildPurchaseOrder(overrides: Partial<PurchaseOrderWithDetails> = {}): PurchaseOrderWithDetails {
  return {
    id: "po_1",
    organizationId: "org_1",
    storeId: "store_1",
    supplierId: "supplier_1",
    supplierName: "Acme Supplies",
    status: "ORDERED",
    totalCostCents: 1000,
    receivedAt: null,
    createdAt: new Date(),
    lineItems: [
      {
        id: "li_1",
        purchaseOrderId: "po_1",
        productId: "product_1",
        productName: "Widget",
        quantityOrdered: 10,
        quantityReceived: 0,
        unitCostCents: 100,
      },
    ],
    ...overrides,
  };
}

function buildRepositories(existingQuantity: number | null): PurchaseOrdersUnitOfWorkRepositories {
  return {
    purchaseOrders: {
      create: vi.fn(),
      findById: vi.fn(),
      listByStore: vi.fn(),
      markLineItemReceived: vi.fn(),
      updateStatus: vi.fn().mockImplementation(async (id, status, receivedAt) => ({
        ...buildPurchaseOrder(),
        status,
        receivedAt: receivedAt ?? null,
      })),
    },
    inventoryItems: {
      findByStoreAndProduct: vi.fn().mockResolvedValue(
        existingQuantity === null
          ? null
          : {
              id: "inv_1",
              organizationId: "org_1",
              storeId: "store_1",
              productId: "product_1",
              quantity: existingQuantity,
              reorderThreshold: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
      ),
      setQuantity: vi.fn().mockImplementation(async (organizationId, storeId, productId, quantity) => ({
        id: "inv_1",
        organizationId,
        storeId,
        productId,
        quantity,
        reorderThreshold: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      setReorderThreshold: vi.fn(),
      listByStore: vi.fn(),
    },
    stockMovements: {
      create: vi.fn().mockImplementation(async (input) => ({ id: "movement_1", ...input, createdAt: new Date() })),
    },
  };
}

describe("ReceivePurchaseOrderUseCase", () => {
  it("throws NotFoundError when the purchase order does not exist", async () => {
    const repositories = buildRepositories(0);
    const purchaseOrdersRepository = { ...repositories.purchaseOrders, findById: vi.fn().mockResolvedValue(null) };
    const unitOfWork: PurchaseOrdersUnitOfWork = { runInTransaction: vi.fn() };
    const useCase = new ReceivePurchaseOrderUseCase(purchaseOrdersRepository, unitOfWork);

    await expect(
      useCase.execute("org_1", "store_1", "po_1", { lineItems: [{ lineItemId: "li_1", quantityReceived: 10 }] })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws ValidationError when the purchase order is already fully RECEIVED or CANCELLED", async () => {
    const repositories = buildRepositories(0);
    const purchaseOrdersRepository = {
      ...repositories.purchaseOrders,
      findById: vi.fn().mockResolvedValue(buildPurchaseOrder({ status: "RECEIVED" })),
    };
    const unitOfWork: PurchaseOrdersUnitOfWork = { runInTransaction: vi.fn() };
    const useCase = new ReceivePurchaseOrderUseCase(purchaseOrdersRepository, unitOfWork);

    await expect(
      useCase.execute("org_1", "store_1", "po_1", { lineItems: [{ lineItemId: "li_1", quantityReceived: 10 }] })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError when receiving more than the remaining ordered quantity", async () => {
    const repositories = buildRepositories(0);
    const purchaseOrdersRepository = {
      ...repositories.purchaseOrders,
      findById: vi.fn().mockResolvedValue(buildPurchaseOrder({ lineItems: [
        { id: "li_1", purchaseOrderId: "po_1", productId: "product_1", productName: "Widget", quantityOrdered: 10, quantityReceived: 6, unitCostCents: 100 },
      ] })),
    };
    const unitOfWork: PurchaseOrdersUnitOfWork = { runInTransaction: vi.fn() };
    const useCase = new ReceivePurchaseOrderUseCase(purchaseOrdersRepository, unitOfWork);

    await expect(
      useCase.execute("org_1", "store_1", "po_1", { lineItems: [{ lineItemId: "li_1", quantityReceived: 5 }] })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("partially receives a line item, leaving the order PARTIALLY_RECEIVED with no receivedAt", async () => {
    const repositories = buildRepositories(5);
    const purchaseOrdersRepository = {
      ...repositories.purchaseOrders,
      findById: vi.fn().mockResolvedValue(buildPurchaseOrder()),
    };
    const unitOfWork: PurchaseOrdersUnitOfWork = {
      runInTransaction: vi.fn().mockImplementation((work) => work(repositories)),
    };
    const useCase = new ReceivePurchaseOrderUseCase(purchaseOrdersRepository, unitOfWork);

    const result = await useCase.execute("org_1", "store_1", "po_1", {
      lineItems: [{ lineItemId: "li_1", quantityReceived: 4 }],
    });

    expect(repositories.inventoryItems.setQuantity).toHaveBeenCalledWith("org_1", "store_1", "product_1", 9);
    expect(repositories.stockMovements.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "RECEIVE", quantityChange: 4 })
    );
    expect(repositories.purchaseOrders.markLineItemReceived).toHaveBeenCalledWith("li_1", 4);
    expect(repositories.purchaseOrders.updateStatus).toHaveBeenCalledWith("po_1", "PARTIALLY_RECEIVED", undefined);
    expect(result.status).toBe("PARTIALLY_RECEIVED");
  });

  it("marks the order RECEIVED with a receivedAt once the last remaining quantity comes in", async () => {
    const repositories = buildRepositories(5);
    const purchaseOrdersRepository = {
      ...repositories.purchaseOrders,
      findById: vi.fn().mockResolvedValue(
        buildPurchaseOrder({
          status: "PARTIALLY_RECEIVED",
          lineItems: [
            { id: "li_1", purchaseOrderId: "po_1", productId: "product_1", productName: "Widget", quantityOrdered: 10, quantityReceived: 4, unitCostCents: 100 },
          ],
        })
      ),
    };
    const unitOfWork: PurchaseOrdersUnitOfWork = {
      runInTransaction: vi.fn().mockImplementation((work) => work(repositories)),
    };
    const useCase = new ReceivePurchaseOrderUseCase(purchaseOrdersRepository, unitOfWork);

    const result = await useCase.execute("org_1", "store_1", "po_1", {
      lineItems: [{ lineItemId: "li_1", quantityReceived: 6 }],
    });

    expect(repositories.purchaseOrders.markLineItemReceived).toHaveBeenCalledWith("li_1", 10);
    expect(repositories.purchaseOrders.updateStatus).toHaveBeenCalledWith("po_1", "RECEIVED", expect.any(Date));
    expect(result.status).toBe("RECEIVED");
  });
});
