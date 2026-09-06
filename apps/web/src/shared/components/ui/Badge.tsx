import type { PropsWithChildren } from "react";

export type BadgeTone = "neutral" | "info" | "warning" | "success" | "danger";

interface BadgeProps extends PropsWithChildren {
  tone?: BadgeTone;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-primary-100 text-primary-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
};

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
