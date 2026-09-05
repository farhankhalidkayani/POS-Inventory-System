"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useRegister } from "../hooks/useRegister";

const INITIAL_FORM_STATE = {
  organizationName: "",
  storeName: "",
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
  ownerPassword: "",
};

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  function updateField(field: keyof typeof INITIAL_FORM_STATE) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await registerMutation.mutateAsync(form);
      router.push("/dashboard");
    } catch {
      // error state is surfaced via registerMutation.error below
    }
  }

  const errorMessage = registerMutation.error instanceof ApiError ? registerMutation.error.message : null;

  return (
    <Card>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Create your organization</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input label="Organization name" name="organizationName" value={form.organizationName} onChange={updateField("organizationName")} required />
        <Input label="Store name" name="storeName" value={form.storeName} onChange={updateField("storeName")} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" name="ownerFirstName" value={form.ownerFirstName} onChange={updateField("ownerFirstName")} required />
          <Input label="Last name" name="ownerLastName" value={form.ownerLastName} onChange={updateField("ownerLastName")} required />
        </div>
        <Input label="Email" type="email" name="ownerEmail" value={form.ownerEmail} onChange={updateField("ownerEmail")} required />
        <Input
          label="Password"
          type="password"
          name="ownerPassword"
          value={form.ownerPassword}
          onChange={updateField("ownerPassword")}
          minLength={8}
          required
        />
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <Button type="submit" isLoading={registerMutation.isPending}>
          Create organization
        </Button>
      </form>
    </Card>
  );
}
