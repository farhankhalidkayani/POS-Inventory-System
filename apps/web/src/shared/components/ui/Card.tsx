import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>;
}
