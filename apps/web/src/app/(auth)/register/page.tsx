import Link from "next/link";
import { RegisterForm } from "../../../features/auth";
import { AuthLayout } from "../../../shared/components/layout/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-700 underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
