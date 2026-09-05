"use client";

import { useState } from "react";
import type { ProductResponse } from "@pos/shared";
import { Button } from "../../../shared/components/ui/Button";
import { ApiError } from "../../../shared/api/httpClient";
import { useProducts } from "../../catalog";
import { useStoreInventory } from "../hooks/useStoreInventory";
import { useAdjustStock } from "../hooks/useAdjustStock";

interface InventoryRow {
  product: ProductResponse;
  quantity: number;
  reorderThreshold: number;
  isLowStock: boolean;
}

export function InventoryTable({ storeId }: { storeId: string | undefined }) {
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: inventoryItems, isLoading: isLoadingInventory } = useStoreInventory(storeId);
  const adjustStock = useAdjustStock(storeId);
  const [quantityChangeByProduct, setQuantityChangeByProduct] = useState<Record<string, string>>({});

  if (isLoadingProducts || isLoadingInventory) {
    return <p className="text-sm text-slate-600">Loading inventory...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-sm text-slate-600">No products yet — add one in the Products page first.</p>;
  }

  const inventoryByProductId = new Map((inventoryItems ?? []).map((item) => [item.product.id, item]));
  const rows: InventoryRow[] = products.map((product) => {
    const existing = inventoryByProductId.get(product.id);
    return {
      product,
      quantity: existing?.quantity ?? 0,
      reorderThreshold: existing?.reorderThreshold ?? 0,
      isLowStock: existing?.isLowStock ?? true,
    };
  });

  async function handleAdjust(productId: string) {
    const rawValue = quantityChangeByProduct[productId];
    const quantityChange = Number.parseInt(rawValue ?? "", 10);
    if (!Number.isFinite(quantityChange) || quantityChange === 0) return;

    await adjustStock.mutateAsync({ productId, type: "ADJUSTMENT", quantityChange });
    setQuantityChangeByProduct((prev) => ({ ...prev, [productId]: "" }));
  }

  const errorMessage = adjustStock.error instanceof ApiError ? adjustStock.error.message : null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Quantity</th>
            <th className="py-2 pr-4">Reorder at</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Adjust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product.id} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-900">{row.product.name}</td>
              <td className="py-2 pr-4 text-slate-900">{row.quantity}</td>
              <td className="py-2 pr-4 text-slate-600">{row.reorderThreshold}</td>
              <td className="py-2 pr-4">
                {row.isLowStock ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Low stock</span>
                ) : (
                  <span className="text-xs text-slate-500">OK</span>
                )}
              </td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    placeholder="±qty"
                    value={quantityChangeByProduct[row.product.id] ?? ""}
                    onChange={(event) =>
                      setQuantityChangeByProduct((prev) => ({ ...prev, [row.product.id]: event.target.value }))
                    }
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleAdjust(row.product.id)}
                    isLoading={adjustStock.isPending && adjustStock.variables?.productId === row.product.id}
                  >
                    Apply
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
