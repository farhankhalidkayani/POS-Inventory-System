"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthSession, useLogout } from "../../features/auth";
import { Button } from "../../shared/components/ui/Button";
import { Card } from "../../shared/components/ui/Card";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isBootstrapping } = useAuthSession();
  const logoutMutation = useLogout();

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Card>
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          Welcome, {session.user.firstName} {session.user.lastName}
        </h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Role</dt>
          <dd className="text-slate-900">{session.user.role}</dd>
          <dt className="text-slate-500">Organization</dt>
          <dd className="text-slate-900">{session.organization.name}</dd>
          <dt className="text-slate-500">Store</dt>
          <dd className="text-slate-900">{session.store?.name ?? "No store assigned"}</dd>
        </dl>
        <div className="mt-6 flex gap-3">
          <Link href="/checkout" className="text-sm font-medium text-slate-900 underline">
            Checkout
          </Link>
          <Link href="/products" className="text-sm font-medium text-slate-900 underline">
            Products
          </Link>
          <Link href="/inventory" className="text-sm font-medium text-slate-900 underline">
            Inventory
          </Link>
          <Link href="/sales" className="text-sm font-medium text-slate-900 underline">
            Sales
          </Link>
          {["OWNER", "ADMIN", "MANAGER"].includes(session.user.role) ? (
            <>
              <Link href="/reports" className="text-sm font-medium text-slate-900 underline">
                Reports
              </Link>
              <Link href="/purchase-orders" className="text-sm font-medium text-slate-900 underline">
                Purchase Orders
              </Link>
              <Link href="/discounts" className="text-sm font-medium text-slate-900 underline">
                Discounts
              </Link>
            </>
          ) : null}
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => logoutMutation.mutate()}
          isLoading={logoutMutation.isPending}
        >
          Log out
        </Button>
      </Card>
    </main>
  );
}
