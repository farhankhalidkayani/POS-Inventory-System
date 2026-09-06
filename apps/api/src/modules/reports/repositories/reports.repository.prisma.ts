import type { Prisma, PrismaClient } from "../../../shared/db/prisma.js";
import type { ReportsRepository, SalesSummary, TopProduct } from "./reports.repository.js";

type Client = PrismaClient | Prisma.TransactionClient;

interface SalesByDayRow {
  day: Date;
  revenue_cents: bigint;
  sale_count: bigint;
}

export class PrismaReportsRepository implements ReportsRepository {
  constructor(private readonly client: Client) {}

  async getSalesSummary(organizationId: string, storeId: string, since: Date): Promise<SalesSummary> {
    const [aggregate, byDayRows] = await Promise.all([
      this.client.sale.aggregate({
        where: { organizationId, storeId, createdAt: { gte: since } },
        _sum: { totalCents: true },
        _count: true,
      }),
      this.client.$queryRaw<SalesByDayRow[]>`
        SELECT date_trunc('day', "createdAt") AS day,
               COALESCE(SUM("totalCents"), 0)::bigint AS revenue_cents,
               COUNT(*)::bigint AS sale_count
        FROM "Sale"
        WHERE "organizationId" = ${organizationId} AND "storeId" = ${storeId} AND "createdAt" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    return {
      totalRevenueCents: aggregate._sum.totalCents ?? 0,
      saleCount: aggregate._count,
      byDay: byDayRows.map((row) => ({
        date: row.day.toISOString().slice(0, 10),
        revenueCents: Number(row.revenue_cents),
        saleCount: Number(row.sale_count),
      })),
    };
  }

  async getTopProducts(organizationId: string, storeId: string, since: Date, limit: number): Promise<TopProduct[]> {
    const grouped = await this.client.saleLineItem.groupBy({
      by: ["productId"],
      where: { sale: { organizationId, storeId, createdAt: { gte: since } } },
      _sum: { quantity: true, lineTotalCents: true },
      orderBy: { _sum: { lineTotalCents: "desc" } },
      take: limit,
    });

    if (grouped.length === 0) {
      return [];
    }

    const products = await this.client.product.findMany({
      where: { id: { in: grouped.map((row) => row.productId) } },
    });
    const productNameById = new Map(products.map((product) => [product.id, product.name]));

    return grouped.map((row) => ({
      productId: row.productId,
      productName: productNameById.get(row.productId) ?? "Unknown product",
      quantitySold: row._sum.quantity ?? 0,
      revenueCents: row._sum.lineTotalCents ?? 0,
    }));
  }
}
