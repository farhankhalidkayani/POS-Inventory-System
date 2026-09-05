import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none ${className ?? ""}`}
        {...rest}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
