import Link from "next/link";
import { LoginForm } from "../../../features/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <LoginForm />
      <p className="text-sm text-slate-600">
        Need an organization?{" "}
        <Link href="/register" className="font-medium text-slate-900 underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
