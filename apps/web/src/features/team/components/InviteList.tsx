"use client";

import { useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { useInvites } from "../hooks/useInvites";
import { useRevokeInvite } from "../hooks/useRevokeInvite";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REVOKED: "bg-slate-200 text-slate-600",
};

export function InviteList() {
  const { data: invites, isLoading } = useInvites();
  const revokeInvite = useRevokeInvite();
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading invites...</p>;
  }

  if (!invites || invites.length === 0) {
    return <p className="text-sm text-slate-600">No invites yet.</p>;
  }

  function inviteLink(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/accept-invite?token=${token}`;
  }

  async function handleCopyLink(inviteId: string, token: string) {
    await navigator.clipboard.writeText(inviteLink(token));
    setCopiedInviteId(inviteId);
    setTimeout(() => setCopiedInviteId((current) => (current === inviteId ? null : current)), 2000);
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Email</th>
          <th className="py-2 pr-4">Role</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-4" />
        </tr>
      </thead>
      <tbody>
        {invites.map((invite) => (
          <tr key={invite.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 text-slate-900">{invite.email}</td>
            <td className="py-2 pr-4 text-slate-600">{invite.role}</td>
            <td className="py-2 pr-4">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[invite.status]}`}>
                {invite.status}
              </span>
            </td>
            <td className="py-2 pr-4">
              {invite.status === "PENDING" ? (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleCopyLink(invite.id, invite.token)}>
                    {copiedInviteId === invite.id ? "Copied!" : "Copy link"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => revokeInvite.mutate(invite.id)}
                    isLoading={revokeInvite.isPending && revokeInvite.variables === invite.id}
                  >
                    Revoke
                  </Button>
                </div>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
