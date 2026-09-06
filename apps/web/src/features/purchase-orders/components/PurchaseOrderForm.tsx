"use client";

import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { ApiError } from "../../../shared/api/httpClient";
import { useProducts } from "../../catalog";
import { useSuppliers, useCreateSupplier } from "../../suppliers";
import { useCreatePurchaseOrder } from "../hooks/useCreatePurchaseOrder";

interface DraftLineItem {
  productId: string;
  productName: string;
  quantityOrdered: number;
  unitCostCents: number;
}

export function PurchaseOrderForm({ storeId }: { storeId: string | undefined }) {
  const { data: products } = useProducts();
  const { data: suppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const createPurchaseOrder = useCreatePurchaseOrder(storeId);

  const [supplierId, setSupplierId] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCostDollars, setUnitCostDollars] = useState("");
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreateSupplier() {
    if (!newSupplierName.trim()) return;
    const supplier = await createSupplier.mutateAsync({ name: newSupplierName.trim() });
    setNewSupplierName("");
    setSupplierId(supplier.id);
  }

  function handleAddLineItem() {
    const product = products?.find((p) => p.id === selectedProductId);
    const parsedQuantity = Number.parseInt(quantity, 10);
    const unitCostCents = Math.round(Number.parseFloat(unitCostDollars) * 100);
    if (!product || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || !Number.isFinite(unitCostCents)) return;

    setLineItems((prev) => [
      ...prev,
      { productId: product.id, productName: product.name, quantityOrdered: parsedQuantity, unitCostCents },
    ]);
    setQuantity("1");
    setUnitCostDollars("");
  }

  function handleRemoveLineItem(productId: string) {
    setLineItems((prev) => prev.filter((line) => line.productId !== productId));
  }

  async function handleSubmit() {
    if (!supplierId || lineItems.length === 0) return;
    setSuccessMessage(null);
    await createPurchaseOrder.mutateAsync({
      supplierId,
      lineItems: lineItems.map((line) => ({
        productId: line.productId,
        quantityOrdered: line.quantityOrdered,
        unitCostCents: line.unitCostCents,
      })),
    });
    setLineItems([]);
    setSuccessMessage("Purchase order created.");
  }

  const totalCents = lineItems.reduce((sum, line) => sum + line.unitCostCents * line.quantityOrdered, 0);
  const errorMessage =
    createPurchaseOrder.error instanceof ApiError
      ? createPurchaseOrder.error.message
      : createSupplier.error instanceof ApiError
        ? createSupplier.error.message
        : null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">New purchase order</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="supplierId" className="text-sm font-medium text-slate-700">
          Supplier
        </label>
        <select
          id="supplierId"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={supplierId}
          onChange={(event) => setSupplierId(event.target.value)}
        >
          <option value="">Select a supplier</option>
          {suppliers?.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="New supplier"
            name="newSupplierName"
            value={newSupplierName}
            onChange={(event) => setNewSupplierName(event.target.value)}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleCreateSupplier} isLoading={createSupplier.isPending}>
          Add supplier
        </Button>
      </div>

      <div className="flex items-end gap-2 border-t border-slate-100 pt-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="lineItemProduct" className="text-sm font-medium text-slate-700">
            Product
          </label>
          <select
            id="lineItemProduct"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
          >
            <option value="">Select a product</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-20 flex-col gap-1">
          <label htmlFor="lineItemQuantity" className="text-sm font-medium text-slate-700">
            Qty
          </label>
          <input
            id="lineItemQuantity"
            type="number"
            min="1"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <label htmlFor="lineItemUnitCost" className="text-sm font-medium text-slate-700">
            Unit cost
          </label>
          <input
            id="lineItemUnitCost"
            type="number"
            min="0"
            step="0.01"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={unitCostDollars}
            onChange={(event) => setUnitCostDollars(event.target.value)}
          />
        </div>
        <Button type="button" onClick={handleAddLineItem}>
          Add line
        </Button>
      </div>

      {lineItems.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4">Product</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Unit cost</th>
              <th className="py-2 pr-4">Line total</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((line) => (
              <tr key={line.productId} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-900">{line.productName}</td>
                <td className="py-2 pr-4 text-slate-900">{line.quantityOrdered}</td>
                <td className="py-2 pr-4 text-slate-600">{formatCentsAsCurrency(line.unitCostCents)}</td>
                <td className="py-2 pr-4 text-slate-900">
                  {formatCentsAsCurrency(line.unitCostCents * line.quantityOrdered)}
                </td>
                <td className="py-2 pr-4">
                  <Button variant="secondary" onClick={() => handleRemoveLineItem(line.productId)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">Total: {formatCentsAsCurrency(totalCents)}</p>
        <Button onClick={handleSubmit} isLoading={createPurchaseOrder.isPending} disabled={!supplierId || lineItems.length === 0}>
          Create purchase order
        </Button>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
    </div>
  );
}
