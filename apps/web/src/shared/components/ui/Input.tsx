import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-md border px-3 py-2 text-sm text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-primary-500"} ${className ?? ""}`}
        {...rest}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
