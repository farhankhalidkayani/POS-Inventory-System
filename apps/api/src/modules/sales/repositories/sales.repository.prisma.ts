import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { CreateSaleInput, SaleWithLineItems } from "../entities/Sale.js";
import type { SalesRepository } from "./sales.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

const WITH_LINE_ITEMS = { include: { lineItems: { include: { product: true } } } } as const;

type RawSale = Prisma.SaleGetPayload<typeof WITH_LINE_ITEMS>;

function toSaleWithLineItems(sale: RawSale): SaleWithLineItems {
  return {
    id: sale.id,
    organizationId: sale.organizationId,
    storeId: sale.storeId,
    userId: sale.userId,
    paymentMethod: sale.paymentMethod,
    totalCents: sale.totalCents,
    createdAt: sale.createdAt,
    lineItems: sale.lineItems.map((lineItem) => ({
      id: lineItem.id,
      saleId: lineItem.saleId,
      productId: lineItem.productId,
      quantity: lineItem.quantity,
      unitPriceCents: lineItem.unitPriceCents,
      lineTotalCents: lineItem.lineTotalCents,
      productName: lineItem.product.name,
    })),
  };
}

export class PrismaSalesRepository implements SalesRepository {
  constructor(private readonly client: Client) {}

  async create(input: CreateSaleInput): Promise<SaleWithLineItems> {
    const sale = await this.client.sale.create({
      data: {
        organizationId: input.organizationId,
        storeId: input.storeId,
        userId: input.userId,
        paymentMethod: input.paymentMethod,
        totalCents: input.totalCents,
        lineItems: {
          create: input.lineItems.map((lineItem) => ({
            productId: lineItem.productId,
            quantity: lineItem.quantity,
            unitPriceCents: lineItem.unitPriceCents,
            lineTotalCents: lineItem.lineTotalCents,
          })),
        },
      },
      ...WITH_LINE_ITEMS,
    });

    return toSaleWithLineItems(sale);
  }

  async findById(organizationId: string, storeId: string, id: string): Promise<SaleWithLineItems | null> {
    const sale = await this.client.sale.findFirst({
      where: { id, organizationId, storeId },
      ...WITH_LINE_ITEMS,
    });
    return sale ? toSaleWithLineItems(sale) : null;
  }

  async listByStore(organizationId: string, storeId: string): Promise<SaleWithLineItems[]> {
    const sales = await this.client.sale.findMany({
      where: { organizationId, storeId },
      orderBy: { createdAt: "desc" },
      ...WITH_LINE_ITEMS,
    });
    return sales.map(toSaleWithLineItems);
  }
}
