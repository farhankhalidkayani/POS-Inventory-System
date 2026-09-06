"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { SalesSummaryCard, TopProductsList, LowStockAlert } from "../../features/reports";

const REPORT_VIEWER_ROLES = ["OWNER", "ADMIN", "MANAGER"];

export default function ReportsPage() {
  const { session } = useAuthSession();
  const canViewReports = !!session && REPORT_VIEWER_ROLES.includes(session.user.role);

  return (
    <AppShell title={`Reports${session?.store?.name ? ` — ${session.store.name}` : ""}`}>
      {canViewReports ? (
        <div className="flex flex-col gap-6">
          <SalesSummaryCard storeId={session?.store?.id} />
          <TopProductsList storeId={session?.store?.id} />
          <LowStockAlert storeId={session?.store?.id} />
        </div>
      ) : (
        <p className="text-sm text-slate-600">Reports are only available to owners, admins, and managers.</p>
      )}
    </AppShell>
  );
}
