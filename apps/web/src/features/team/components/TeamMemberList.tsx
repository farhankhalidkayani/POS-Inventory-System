"use client";

import { useOrgMembers } from "../hooks/useOrgMembers";

export function TeamMemberList() {
  const { data: members, isLoading } = useOrgMembers();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading team...</p>;
  }

  if (!members || members.length === 0) {
    return <p className="text-sm text-slate-600">No team members yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          <th className="py-2 pr-4">Name</th>
          <th className="py-2 pr-4">Email</th>
          <th className="py-2 pr-4">Role</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id} className="border-b border-slate-100">
            <td className="py-2 pr-4 text-slate-900">
              {member.firstName} {member.lastName}
            </td>
            <td className="py-2 pr-4 text-slate-600">{member.email}</td>
            <td className="py-2 pr-4 text-slate-900">{member.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
