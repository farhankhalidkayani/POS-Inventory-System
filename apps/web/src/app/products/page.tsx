"use client";

import { AppShell } from "../../shared/components/layout/AppShell";
import { ProductForm, ProductList } from "../../features/catalog";
import { Card } from "../../shared/components/ui/Card";

export default function ProductsPage() {
  return (
    <AppShell title="Products">
      <div className="flex flex-col gap-6">
        <ProductForm />
        <Card>
          <ProductList />
        </Card>
      </div>
    </AppShell>
  );
}
