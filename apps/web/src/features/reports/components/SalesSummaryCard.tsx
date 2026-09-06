"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { useSalesSummary } from "../hooks/useSalesSummary";

export function SalesSummaryCard({ storeId }: { storeId: string | undefined }) {
  const { data: summary, isLoading } = useSalesSummary(storeId, 7);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading sales summary...</p>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Last 7 days</h2>
      <div className="mb-4 flex gap-8">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{formatCentsAsCurrency(summary.totalRevenueCents)}</p>
          <p className="text-sm text-slate-500">Revenue</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">{summary.saleCount}</p>
          <p className="text-sm text-slate-500">Sales</p>
        </div>
      </div>
      {summary.byDay.length === 0 ? (
        <p className="text-sm text-slate-600">No sales in this period.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4">Day</th>
              <th className="py-2 pr-4">Sales</th>
              <th className="py-2 pr-4">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {summary.byDay.map((day) => (
              <tr key={day.date} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-900">{day.date}</td>
                <td className="py-2 pr-4 text-slate-900">{day.saleCount}</td>
                <td className="py-2 pr-4 text-slate-900">{formatCentsAsCurrency(day.revenueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
