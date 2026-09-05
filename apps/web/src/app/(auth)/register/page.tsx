import Link from "next/link";
import { RegisterForm } from "../../../features/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <RegisterForm />
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
