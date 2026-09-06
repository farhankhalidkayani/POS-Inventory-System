"use client";

import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { TeamMemberList, InviteForm, InviteList } from "../../features/team";
import { Card } from "../../shared/components/ui/Card";

const TEAM_MANAGER_ROLES = ["OWNER", "ADMIN"];

export default function TeamPage() {
  const { session } = useAuthSession();
  const canManageTeam = !!session && TEAM_MANAGER_ROLES.includes(session.user.role);

  return (
    <AppShell title="Team">
      <div className="flex flex-col gap-6">
        <Card>
          <TeamMemberList />
        </Card>
        {canManageTeam ? (
          <>
            <InviteForm />
            <Card>
              <InviteList />
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
