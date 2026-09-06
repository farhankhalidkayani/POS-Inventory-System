"use client";

import { AppShell } from "../../shared/components/layout/AppShell";
import { DiscountForm, DiscountList } from "../../features/discounts";
import { Card } from "../../shared/components/ui/Card";

export default function DiscountsPage() {
  return (
    <AppShell title="Discounts">
      <div className="flex flex-col gap-6">
        <DiscountForm />
        <Card>
          <DiscountList />
        </Card>
      </div>
    </AppShell>
  );
}
