"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { useDiscounts } from "../hooks/useDiscounts";

export function DiscountList() {
  const { data: discounts, isLoading } = useDiscounts();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading discounts...</p>;
  }

  if (!discounts || discounts.length === 0) {
    return <p className="text-sm text-slate-600">No discount codes yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Code</th>
          <th className="py-2 pr-4">Type</th>
          <th className="py-2 pr-4">Value</th>
          <th className="py-2 pr-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {discounts.map((discount) => (
          <tr key={discount.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 font-medium text-slate-900">{discount.code}</td>
            <td className="py-2 pr-4 text-slate-600">{discount.type}</td>
            <td className="py-2 pr-4 text-slate-900">
              {discount.type === "PERCENTAGE" ? `${discount.value}%` : formatCentsAsCurrency(discount.value)}
            </td>
            <td className="py-2 pr-4 text-slate-600">{discount.active ? "Active" : "Inactive"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
