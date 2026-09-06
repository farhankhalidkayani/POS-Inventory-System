"use client";

import { formatCentsAsCurrency } from "../../../shared/lib/formatCurrency";
import { Button } from "../../../shared/components/ui/Button";
import { ApiError } from "../../../shared/api/httpClient";
import { useStorePurchaseOrders } from "../hooks/useStorePurchaseOrders";
import { useReceivePurchaseOrder } from "../hooks/useReceivePurchaseOrder";
import { useCancelPurchaseOrder } from "../hooks/useCancelPurchaseOrder";

const STATUS_STYLES: Record<string, string> = {
  ORDERED: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-200 text-slate-600",
};

export function PurchaseOrderList({ storeId }: { storeId: string | undefined }) {
  const { data: purchaseOrders, isLoading } = useStorePurchaseOrders(storeId);
  const receivePurchaseOrder = useReceivePurchaseOrder(storeId);
  const cancelPurchaseOrder = useCancelPurchaseOrder(storeId);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading purchase orders...</p>;
  }

  if (!purchaseOrders || purchaseOrders.length === 0) {
    return <p className="text-sm text-slate-600">No purchase orders yet.</p>;
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
      {purchaseOrders.map((po) => (
        <div key={po.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">{po.supplierName}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[po.status]}`}>
              {po.status}
            </span>
            <span className="font-semibold text-slate-900">{formatCentsAsCurrency(po.totalCostCents)}</span>
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
            {po.lineItems.map((lineItem) => (
              <li key={lineItem.id}>
                {lineItem.quantityOrdered} × {lineItem.productName} ({formatCentsAsCurrency(lineItem.unitCostCents)}{" "}
                each){lineItem.quantityReceived > 0 ? ` — received ${lineItem.quantityReceived}` : ""}
              </li>
            ))}
          </ul>
          {po.status === "ORDERED" ? (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => receivePurchaseOrder.mutate(po.id)}
                isLoading={receivePurchaseOrder.isPending && receivePurchaseOrder.variables === po.id}
              >
                Receive
              </Button>
              <Button
                variant="secondary"
                onClick={() => cancelPurchaseOrder.mutate(po.id)}
                isLoading={cancelPurchaseOrder.isPending && cancelPurchaseOrder.variables === po.id}
              >
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
