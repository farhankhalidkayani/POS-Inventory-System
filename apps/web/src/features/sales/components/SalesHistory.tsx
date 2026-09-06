"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { useStoreSales } from "../hooks/useStoreSales";

export function SalesHistory({ storeId }: { storeId: string | undefined }) {
  const { data: sales, isLoading } = useStoreSales(storeId);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading sales...</p>;
  }

  if (!sales || sales.length === 0) {
    return <p className="text-sm text-slate-600">No sales yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {sales.map((sale) => (
        <div key={sale.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{new Date(sale.createdAt).toLocaleString()}</span>
            <span className="font-medium text-slate-900">{sale.paymentMethod}</span>
            <span className="font-semibold text-slate-900">{formatCentsAsCurrency(sale.totalCents)}</span>
          </div>
          {sale.customerName || sale.discountCode ? (
            <div className="mt-1 flex gap-3 text-xs text-slate-500">
              {sale.customerName ? <span>Customer: {sale.customerName}</span> : null}
              {sale.discountCode ? (
                <span>
                  Discount: {sale.discountCode} (-{formatCentsAsCurrency(sale.discountCents)})
                </span>
              ) : null}
            </div>
          ) : null}
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
            {sale.lineItems.map((lineItem) => (
              <li key={lineItem.id}>
                {lineItem.quantity} × {lineItem.productName} ({formatCentsAsCurrency(lineItem.lineTotalCents)})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
