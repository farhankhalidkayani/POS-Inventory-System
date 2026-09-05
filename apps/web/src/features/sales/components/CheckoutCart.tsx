"use client";

import { useState } from "react";
import type { PaymentMethod } from "@pos/shared";
import { Button } from "../../../shared/components/ui/Button";
import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { ApiError } from "../../../shared/api/httpClient";
import { useProducts } from "../../catalog";
import { useCreateSale } from "../hooks/useCreateSale";

interface CartLine {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export function CheckoutCart({ storeId }: { storeId: string | undefined }) {
  const { data: products } = useProducts();
  const createSale = useCreateSale(storeId);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleAddToCart() {
    const product = products?.find((p) => p.id === selectedProductId);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!product || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + parsedQuantity } : line
        );
      }
      return [...prev, { productId: product.id, name: product.name, unitPriceCents: product.priceCents, quantity: parsedQuantity }];
    });
    setQuantity("1");
  }

  function handleRemoveLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    setSuccessMessage(null);
    const sale = await createSale.mutateAsync({
      paymentMethod,
      lineItems: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    });
    setCart([]);
    setSuccessMessage(`Sale completed — total ${formatCentsAsCurrency(sale.totalCents)}`);
  }

  const totalCents = cart.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const errorMessage = createSale.error instanceof ApiError ? createSale.error.message : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="product" className="text-sm font-medium text-slate-700">
            Product
          </label>
          <select
            id="product"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
          >
            <option value="">Select a product</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatCentsAsCurrency(product.priceCents)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-24 flex-col gap-1">
          <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
            Qty
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <Button type="button" onClick={handleAddToCart}>
          Add to cart
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {cart.length === 0 ? (
          <p className="text-sm text-slate-600">Cart is empty.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Unit price</th>
                <th className="py-2 pr-4">Line total</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {cart.map((line) => (
                <tr key={line.productId} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-900">{line.name}</td>
                  <td className="py-2 pr-4 text-slate-900">{line.quantity}</td>
                  <td className="py-2 pr-4 text-slate-600">{formatCentsAsCurrency(line.unitPriceCents)}</td>
                  <td className="py-2 pr-4 text-slate-900">{formatCentsAsCurrency(line.unitPriceCents * line.quantity)}</td>
                  <td className="py-2 pr-4">
                    <Button variant="secondary" onClick={() => handleRemoveLine(line.productId)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700">
            Payment method
          </label>
          <select
            id="paymentMethod"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
          </select>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-lg font-semibold text-slate-900">Total: {formatCentsAsCurrency(totalCents)}</p>
          <Button onClick={handleCompleteSale} isLoading={createSale.isPending} disabled={cart.length === 0}>
            Complete sale
          </Button>
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
    </div>
  );
}
