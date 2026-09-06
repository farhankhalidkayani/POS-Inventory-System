export interface SalesSummaryDay {
  date: string;
  revenueCents: number;
  saleCount: number;
}

export interface SalesSummary {
  totalRevenueCents: number;
  saleCount: number;
  byDay: SalesSummaryDay[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenueCents: number;
}

export interface ReportsRepository {
  getSalesSummary(organizationId: string, storeId: string, since: Date): Promise<SalesSummary>;
  getTopProducts(organizationId: string, storeId: string, since: Date, limit: number): Promise<TopProduct[]>;
}
