"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch {
      // error state is surfaced via loginMutation.error below
    }
  }

  const errorMessage = loginMutation.error instanceof ApiError ? loginMutation.error.message : null;

  return (
    <Card>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Log in</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <Button type="submit" isLoading={loginMutation.isPending}>
          Log in
        </Button>
      </form>
    </Card>
  );
}
