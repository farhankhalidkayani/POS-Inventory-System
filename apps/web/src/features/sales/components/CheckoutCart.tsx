"use client";

import { useRef, useState } from "react";
import type { PaymentMethod, ProductResponse } from "@pos/shared";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { ApiError } from "../../../shared/api/httpClient";
import { useProducts, useFindProductByBarcode } from "../../catalog";
import { useCustomers, useCreateCustomer } from "../../customers";
import { useCreateSale } from "../hooks/useCreateSale";

interface CartLine {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export function CheckoutCart({ storeId }: { storeId: string | undefined }) {
  const { data: products } = useProducts();
  const findProductByBarcode = useFindProductByBarcode();
  const { data: customers } = useCustomers();
  const createCustomer = useCreateCustomer();
  const createSale = useCreateSale(storeId);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  function addProductToCart(product: ProductResponse, quantityToAdd: number) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + quantityToAdd } : line
        );
      }
      return [...prev, { productId: product.id, name: product.name, unitPriceCents: product.priceCents, quantity: quantityToAdd }];
    });
  }

  function handleAddToCart() {
    const product = products?.find((p) => p.id === selectedProductId);
    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!product || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;

    addProductToCart(product, parsedQuantity);
    setQuantity("1");
  }

  async function handleBarcodeSubmit() {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    setBarcodeError(null);

    try {
      const product = await findProductByBarcode.mutateAsync(barcode);
      addProductToCart(product, 1);
      setBarcodeInput("");
    } catch (error) {
      setBarcodeError(error instanceof ApiError ? error.message : "Could not look up that barcode.");
    } finally {
      barcodeInputRef.current?.focus();
    }
  }

  function handleRemoveLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  async function handleCreateCustomer() {
    const trimmed = newCustomerName.trim();
    if (!trimmed) return;
    const [firstName = trimmed, ...rest] = trimmed.split(" ");
    const lastName = rest.join(" ") || firstName;
    const customer = await createCustomer.mutateAsync({ firstName, lastName });
    setNewCustomerName("");
    setCustomerId(customer.id);
  }

  async function handleCompleteSale() {
    if (cart.length === 0) return;
    setSuccessMessage(null);
    const sale = await createSale.mutateAsync({
      paymentMethod,
      lineItems: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      customerId: customerId || undefined,
      discountCode: discountCode || undefined,
    });
    setCart([]);
    setDiscountCode("");
    const discountNote = sale.discountCents > 0 ? ` (discount: -${formatCentsAsCurrency(sale.discountCents)})` : "";
    setSuccessMessage(`Sale completed — total ${formatCentsAsCurrency(sale.totalCents)}${discountNote}`);
  }

  const totalCents = cart.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const errorMessage =
    createSale.error instanceof ApiError
      ? createSale.error.message
      : createCustomer.error instanceof ApiError
        ? createCustomer.error.message
        : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label htmlFor="barcode" className="text-sm font-medium text-slate-700">
          Scan barcode
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="barcode"
            ref={barcodeInputRef}
            type="text"
            autoFocus
            placeholder="Scan or type a barcode, then press Enter"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={barcodeInput}
            onChange={(event) => setBarcodeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleBarcodeSubmit();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleBarcodeSubmit} isLoading={findProductByBarcode.isPending}>
            Add
          </Button>
        </div>
        {barcodeError ? <p className="mt-1 text-sm text-red-600">{barcodeError}</p> : null}
      </div>

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

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="customerId" className="text-sm font-medium text-slate-700">
            Customer (optional)
          </label>
          <select
            id="customerId"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Walk-in customer</option>
            {customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="New customer name"
              name="newCustomerName"
              value={newCustomerName}
              onChange={(event) => setNewCustomerName(event.target.value)}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleCreateCustomer} isLoading={createCustomer.isPending}>
            Add customer
          </Button>
        </div>
        <Input
          label="Discount code (optional)"
          name="discountCode"
          value={discountCode}
          onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
        />
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
