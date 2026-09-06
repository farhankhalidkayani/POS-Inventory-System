"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthSession } from "../../features/auth";
import { SalesSummaryCard, TopProductsList, LowStockAlert } from "../../features/reports";

const REPORT_VIEWER_ROLES = ["OWNER", "ADMIN", "MANAGER"];

export default function ReportsPage() {
  const router = useRouter();
  const { session, isBootstrapping } = useAuthSession();

  useEffect(() => {
    if (!isBootstrapping && !session) {
      router.replace("/login");
    }
  }, [isBootstrapping, session, router]);

  if (isBootstrapping || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </main>
    );
  }

  const canViewReports = REPORT_VIEWER_ROLES.includes(session.user.role);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Reports — {session.store?.name ?? "No store"}</h1>
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline">
          Back to dashboard
        </Link>
      </div>
      {canViewReports ? (
        <>
          <SalesSummaryCard storeId={session.store?.id} />
          <TopProductsList storeId={session.store?.id} />
          <LowStockAlert storeId={session.store?.id} />
        </>
      ) : (
        <p className="text-sm text-slate-600">Reports are only available to owners, admins, and managers.</p>
      )}
    </main>
  );
}
