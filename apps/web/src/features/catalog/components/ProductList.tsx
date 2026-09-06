"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { Button } from "../../../shared/components/ui/Button";
import { useProducts } from "../hooks/useProducts";
import { useDeleteProduct } from "../hooks/useDeleteProduct";

export function ProductList() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-sm text-slate-600">No products yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">SKU</th>
          <th className="py-2 pr-4">Name</th>
          <th className="py-2 pr-4">Category</th>
          <th className="py-2 pr-4">Barcode</th>
          <th className="py-2 pr-4">Price</th>
          <th className="py-2 pr-4" />
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 text-slate-900">{product.sku}</td>
            <td className="py-2 pr-4 text-slate-900">{product.name}</td>
            <td className="py-2 pr-4 text-slate-600">{product.category?.name ?? "—"}</td>
            <td className="py-2 pr-4 text-slate-600">{product.barcode ?? "—"}</td>
            <td className="py-2 pr-4 text-slate-900">{formatCentsAsCurrency(product.priceCents)}</td>
            <td className="py-2 pr-4">
              <Button
                variant="secondary"
                onClick={() => deleteProduct.mutate(product.id)}
                isLoading={deleteProduct.isPending && deleteProduct.variables === product.id}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
