"use client";

import { useLowStock } from "../hooks/useLowStock";

export function LowStockAlert({ storeId }: { storeId: string | undefined }) {
  const { data: lowStockItems, isLoading } = useLowStock(storeId);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Checking stock levels...</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Low stock</h2>
      {!lowStockItems || lowStockItems.length === 0 ? (
        <p className="text-sm text-slate-600">Everything is sufficiently stocked.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {lowStockItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span className="text-slate-900">{item.product.name}</span>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {item.quantity} left (reorder at {item.reorderThreshold})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
