"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { PurchaseOrderForm, PurchaseOrderList } from "../../features/purchase-orders";

export default function PurchaseOrdersPage() {
  const { session } = useAuthSession();

  return (
    <AppShell title={`Purchase Orders${session?.store?.name ? ` — ${session.store.name}` : ""}`}>
      <div className="flex flex-col gap-6">
        <PurchaseOrderForm storeId={session?.store?.id} />
        <PurchaseOrderList storeId={session?.store?.id} />
      </div>
    </AppShell>
  );
}
