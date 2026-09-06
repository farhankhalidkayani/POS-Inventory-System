import type { PropsWithChildren } from "react";
import { Store } from "lucide-react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-primary-50/60 to-slate-50 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Store className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">POS &amp; Inventory</span>
      </div>
      {children}
    </main>
  );
}
