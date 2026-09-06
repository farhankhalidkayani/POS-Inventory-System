import Link from "next/link";
import { LoginForm } from "../../../features/auth";
import { AuthLayout } from "../../../shared/components/layout/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <p className="text-sm text-slate-600">
        Need an organization?{" "}
        <Link href="/register" className="font-medium text-primary-700 underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
