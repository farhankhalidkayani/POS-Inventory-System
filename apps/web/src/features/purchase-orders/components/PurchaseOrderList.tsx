"use client";

import { useState } from "react";
import type { PurchaseOrderLineItemResponse } from "@pos/shared";
import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { Badge, type BadgeTone } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { ApiError } from "../../../shared/api/httpClient";
import { useStorePurchaseOrders } from "../hooks/useStorePurchaseOrders";
import { useReceivePurchaseOrder } from "../hooks/useReceivePurchaseOrder";
import { useCancelPurchaseOrder } from "../hooks/useCancelPurchaseOrder";

const STATUS_TONES: Record<string, BadgeTone> = {
  ORDERED: "warning",
  PARTIALLY_RECEIVED: "info",
  RECEIVED: "success",
  CANCELLED: "neutral",
};

const RECEIVABLE_STATUSES = ["ORDERED", "PARTIALLY_RECEIVED"];

export function PurchaseOrderList({ storeId }: { storeId: string | undefined }) {
  const { data: purchaseOrders, isLoading } = useStorePurchaseOrders(storeId);
  const receivePurchaseOrder = useReceivePurchaseOrder(storeId);
  const cancelPurchaseOrder = useCancelPurchaseOrder(storeId);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, string>>({});

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading purchase orders...</p>;
  }

  if (!purchaseOrders || purchaseOrders.length === 0) {
    return <p className="text-sm text-slate-600">No purchase orders yet.</p>;
  }

  function remainingFor(lineItemId: string, fallback: string) {
    const raw = receiveQuantities[lineItemId];
    return raw === undefined ? fallback : raw;
  }

  async function handleReceive(purchaseOrderId: string, pendingLineItems: PurchaseOrderLineItemResponse[]) {
    const lineItems = pendingLineItems
      .map((lineItem) => {
        const remaining = lineItem.quantityOrdered - lineItem.quantityReceived;
        const raw = remainingFor(lineItem.id, String(remaining));
        return { lineItemId: lineItem.id, quantityReceived: Number.parseInt(raw, 10) };
      })
      .filter((line) => Number.isFinite(line.quantityReceived) && line.quantityReceived > 0);

    if (lineItems.length === 0) return;

    await receivePurchaseOrder.mutateAsync({ purchaseOrderId, input: { lineItems } });
    setReceiveQuantities((prev) => {
      const next = { ...prev };
      for (const lineItem of pendingLineItems) delete next[lineItem.id];
      return next;
    });
  }

  const errorMessage =
    receivePurchaseOrder.error instanceof ApiError
      ? receivePurchaseOrder.error.message
      : cancelPurchaseOrder.error instanceof ApiError
        ? cancelPurchaseOrder.error.message
        : null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {purchaseOrders.map((po) => {
        const canReceive = RECEIVABLE_STATUSES.includes(po.status);
        const pendingLineItems = po.lineItems.filter((li) => li.quantityReceived < li.quantityOrdered);

        return (
          <div key={po.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{po.supplierName}</span>
              <Badge tone={STATUS_TONES[po.status]}>{po.status.replace("_", " ")}</Badge>
              <span className="font-semibold text-slate-900">{formatCentsAsCurrency(po.totalCostCents)}</span>
            </div>

            {canReceive ? (
              <table className="mt-3 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-1 pr-4">Product</th>
                    <th className="py-1 pr-4">Ordered</th>
                    <th className="py-1 pr-4">Received</th>
                    <th className="py-1 pr-4">Receive now</th>
                  </tr>
                </thead>
                <tbody>
                  {po.lineItems.map((lineItem) => {
                    const remaining = lineItem.quantityOrdered - lineItem.quantityReceived;
                    return (
                      <tr key={lineItem.id} className="border-b border-slate-100">
                        <td className="py-1 pr-4 text-slate-900">{lineItem.productName}</td>
                        <td className="py-1 pr-4 text-slate-600">{lineItem.quantityOrdered}</td>
                        <td className="py-1 pr-4 text-slate-600">{lineItem.quantityReceived}</td>
                        <td className="py-1 pr-4">
                          {remaining > 0 ? (
                            <input
                              type="number"
                              min="0"
                              max={remaining}
                              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                              value={remainingFor(lineItem.id, String(remaining))}
                              onChange={(event) =>
                                setReceiveQuantities((prev) => ({ ...prev, [lineItem.id]: event.target.value }))
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Complete</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                {po.lineItems.map((lineItem) => (
                  <li key={lineItem.id}>
                    {lineItem.quantityOrdered} × {lineItem.productName} ({formatCentsAsCurrency(lineItem.unitCostCents)}{" "}
                    each)
                  </li>
                ))}
              </ul>
            )}

            {canReceive ? (
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => handleReceive(po.id, pendingLineItems)}
                  isLoading={receivePurchaseOrder.isPending && receivePurchaseOrder.variables?.purchaseOrderId === po.id}
                >
                  Receive
                </Button>
                {po.status === "ORDERED" ? (
                  <Button
                    variant="secondary"
                    onClick={() => cancelPurchaseOrder.mutate(po.id)}
                    isLoading={cancelPurchaseOrder.isPending && cancelPurchaseOrder.variables === po.id}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
