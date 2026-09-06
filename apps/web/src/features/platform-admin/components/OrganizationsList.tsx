"use client";

import type { BadgeTone } from "../../../shared/components/ui/Badge";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { useOrganizations } from "../hooks/useOrganizations";
import { useApproveOrganization, useRejectOrganization, useSuspendOrganization } from "../hooks/useReviewOrganization";

const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "neutral",
};

export function OrganizationsList() {
  const { data: organizations, isLoading } = useOrganizations();
  const approveOrganization = useApproveOrganization();
  const rejectOrganization = useRejectOrganization();
  const suspendOrganization = useSuspendOrganization();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading organizations...</p>;
  }

  if (!organizations || organizations.length === 0) {
    return <p className="text-sm text-slate-600">No organizations yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Organization</th>
          <th className="py-2 pr-4">Owner</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-4">Requested</th>
          <th className="py-2 pr-4" />
        </tr>
      </thead>
      <tbody>
        {organizations.map((organization) => (
          <tr key={organization.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 text-slate-900">{organization.name}</td>
            <td className="py-2 pr-4 text-slate-600">
              {organization.ownerName ?? "—"}
              {organization.ownerEmail ? ` (${organization.ownerEmail})` : ""}
            </td>
            <td className="py-2 pr-4">
              <Badge tone={STATUS_TONE[organization.status]}>{organization.status}</Badge>
            </td>
            <td className="py-2 pr-4 text-slate-600">{new Date(organization.createdAt).toLocaleString()}</td>
            <td className="py-2 pr-4">
              <div className="flex gap-2">
                {organization.status === "PENDING" ? (
                  <>
                    <Button
                      onClick={() => approveOrganization.mutate(organization.id)}
                      isLoading={approveOrganization.isPending && approveOrganization.variables === organization.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => rejectOrganization.mutate(organization.id)}
                      isLoading={rejectOrganization.isPending && rejectOrganization.variables === organization.id}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                {organization.status === "APPROVED" ? (
                  <Button
                    variant="secondary"
                    onClick={() => suspendOrganization.mutate(organization.id)}
                    isLoading={suspendOrganization.isPending && suspendOrganization.variables === organization.id}
                  >
                    Suspend
                  </Button>
                ) : null}
                {organization.status === "SUSPENDED" || organization.status === "REJECTED" ? (
                  <Button
                    onClick={() => approveOrganization.mutate(organization.id)}
                    isLoading={approveOrganization.isPending && approveOrganization.variables === organization.id}
                  >
                    {organization.status === "SUSPENDED" ? "Reactivate" : "Approve"}
                  </Button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
