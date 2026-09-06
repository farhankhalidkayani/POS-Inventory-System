"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useAuthSession } from "../../auth";
import { teamApi } from "../api/teamApi";
import { useInviteDetails } from "../hooks/useInviteDetails";

export function AcceptInviteForm({ token }: { token: string | null }) {
  const router = useRouter();
  const { setSession } = useAuthSession();
  const { data: inviteDetails, isLoading, error: detailsError } = useInviteDetails(token);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const acceptInvite = useMutation({
    mutationFn: () => teamApi.acceptInvite({ token: token!, firstName, lastName, password }),
    onSuccess: (session) => {
      setSession(session);
      router.push("/dashboard");
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await acceptInvite.mutateAsync();
  }

  if (!token) {
    return (
      <Card>
        <p className="text-sm text-red-600">This invite link is missing a token.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading invite...</p>
      </Card>
    );
  }

  if (detailsError || !inviteDetails) {
    const message = detailsError instanceof ApiError ? detailsError.message : "This invite link is invalid.";
    return (
      <Card>
        <p className="text-sm text-red-600">{message}</p>
      </Card>
    );
  }

  const errorMessage = acceptInvite.error instanceof ApiError ? acceptInvite.error.message : null;

  return (
    <Card>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Join {inviteDetails.organizationName}</h1>
      <p className="mb-6 text-sm text-slate-600">
        You&apos;ve been invited as <strong>{inviteDetails.role}</strong> ({inviteDetails.email}).
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" name="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
          <Input label="Last name" name="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
        </div>
        <Input
          label="Password"
          name="password"
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <Button type="submit" isLoading={acceptInvite.isPending}>
          Create account
        </Button>
      </form>
    </Card>
  );
}
