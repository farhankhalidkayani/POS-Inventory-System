"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "../../../features/auth";
import { AppShell } from "../../../shared/components/layout/AppShell";
import { OrganizationApprovalList } from "../../../features/platform-admin";
import { Card } from "../../../shared/components/ui/Card";

export default function PlatformAdminOrganizationsPage() {
  const router = useRouter();
  const { session, isBootstrapping } = useAuthSession();

  useEffect(() => {
    if (!isBootstrapping && session && !session.user.isPlatformAdmin) {
      router.replace("/dashboard");
    }
  }, [isBootstrapping, session, router]);

  if (!isBootstrapping && session && !session.user.isPlatformAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Redirecting...</p>
      </main>
    );
  }

  return (
    <AppShell title="Organization Approvals">
      <Card>
        <OrganizationApprovalList />
      </Card>
    </AppShell>
  );
}
