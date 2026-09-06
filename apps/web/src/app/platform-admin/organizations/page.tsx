"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthSession } from "../../../features/auth";
import { OrganizationApprovalList } from "../../../features/platform-admin";

export default function PlatformAdminOrganizationsPage() {
  const router = useRouter();
  const { session, isBootstrapping } = useAuthSession();

  useEffect(() => {
    if (!isBootstrapping && !session) {
      router.replace("/login");
    } else if (!isBootstrapping && session && !session.user.isPlatformAdmin) {
      router.replace("/dashboard");
    }
  }, [isBootstrapping, session, router]);

  if (isBootstrapping || !session || !session.user.isPlatformAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Organization approvals</h1>
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <OrganizationApprovalList />
      </div>
    </main>
  );
}
