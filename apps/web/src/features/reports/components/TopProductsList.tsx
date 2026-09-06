"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { useTopProducts } from "../hooks/useTopProducts";

export function TopProductsList({ storeId }: { storeId: string | undefined }) {
  const { data: topProducts, isLoading } = useTopProducts(storeId, 30, 5);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading top products...</p>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Top products (30 days)</h2>
      {!topProducts || topProducts.length === 0 ? (
        <p className="text-sm text-slate-600">No sales in this period.</p>
      ) : (
        <ol className="flex flex-col gap-2 text-sm">
          {topProducts.map((product, index) => (
            <li key={product.productId} className="flex items-center justify-between">
              <span className="text-slate-900">
                {index + 1}. {product.productName}
              </span>
              <span className="text-slate-600">
                {product.quantitySold} sold — {formatCentsAsCurrency(product.revenueCents)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
