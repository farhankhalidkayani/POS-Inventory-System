"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { InventoryTable } from "../../features/inventory";
import { Card } from "../../shared/components/ui/Card";

export default function InventoryPage() {
  const { session } = useAuthSession();

  return (
    <AppShell title={`Inventory${session?.store?.name ? ` — ${session.store.name}` : ""}`}>
      <Card>
        <InventoryTable storeId={session?.store?.id} />
      </Card>
    </AppShell>
  );
}
