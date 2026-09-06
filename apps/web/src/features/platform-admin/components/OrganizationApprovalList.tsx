"use client";

import { Button } from "../../../shared/components/ui/Button";
import { usePendingOrganizations } from "../hooks/usePendingOrganizations";
import { useApproveOrganization, useRejectOrganization } from "../hooks/useReviewOrganization";

export function OrganizationApprovalList() {
  const { data: organizations, isLoading } = usePendingOrganizations();
  const approveOrganization = useApproveOrganization();
  const rejectOrganization = useRejectOrganization();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading pending sign-ups...</p>;
  }

  if (!organizations || organizations.length === 0) {
    return <p className="text-sm text-slate-600">No organizations are waiting for approval.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Organization</th>
          <th className="py-2 pr-4">Owner</th>
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
            <td className="py-2 pr-4 text-slate-600">{new Date(organization.createdAt).toLocaleString()}</td>
            <td className="py-2 pr-4">
              <div className="flex gap-2">
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
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
