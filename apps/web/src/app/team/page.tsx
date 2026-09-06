"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthSession } from "../../features/auth";
import { TeamMemberList, InviteForm, InviteList } from "../../features/team";

const TEAM_MANAGER_ROLES = ["OWNER", "ADMIN"];

export default function TeamPage() {
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

  const canManageTeam = TEAM_MANAGER_ROLES.includes(session.user.role);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Team</h1>
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <TeamMemberList />
      </div>
      {canManageTeam ? (
        <>
          <InviteForm />
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <InviteList />
          </div>
        </>
      ) : null}
    </main>
  );
}
