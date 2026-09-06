import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ""}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}
