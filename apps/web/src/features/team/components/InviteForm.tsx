"use client";

import { useState, type FormEvent } from "react";
import { ROLES, type Role } from "@pos/shared";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useCreateInvite } from "../hooks/useCreateInvite";

export function InviteForm() {
  const createInvite = useCreateInvite();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("CASHIER");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createInvite.mutateAsync({ email, role });
    setEmail("");
  }

  const errorMessage = createInvite.error instanceof ApiError ? createInvite.error.message : null;

  return (
    <form className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-slate-900">Invite a teammate</h2>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            {ROLES.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <Button type="submit" isLoading={createInvite.isPending}>
        Send invite
      </Button>
    </form>
  );
}
