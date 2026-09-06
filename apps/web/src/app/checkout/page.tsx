"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { CheckoutCart } from "../../features/sales";

export default function CheckoutPage() {
  const { session } = useAuthSession();

  return (
    <AppShell title={`Checkout${session?.store?.name ? ` — ${session.store.name}` : ""}`}>
      <CheckoutCart storeId={session?.store?.id} />
    </AppShell>
  );
}
