import type { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
  narrow?: boolean;
}

export function Card({ children, className, narrow }: CardProps) {
  return (
    <div
      className={`w-full ${narrow ? "max-w-md" : ""} rounded-xl border border-slate-200 bg-white p-6 shadow-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
