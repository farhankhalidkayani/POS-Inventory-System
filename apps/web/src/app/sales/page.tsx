"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { SalesHistory } from "../../features/sales";

export default function SalesPage() {
  const { session } = useAuthSession();

  return (
    <AppShell title={`Sales${session?.store?.name ? ` — ${session.store.name}` : ""}`}>
      <SalesHistory storeId={session?.store?.id} />
    </AppShell>
  );
}
