"use client";

import { useState, type FormEvent } from "react";
import type { DiscountType } from "@pos/shared";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useCreateDiscount } from "../hooks/useCreateDiscount";

export function DiscountForm() {
  const createDiscount = useCreateDiscount();
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("PERCENTAGE");
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedValue = type === "PERCENTAGE" ? Number.parseInt(value, 10) : Math.round(Number.parseFloat(value) * 100);
    await createDiscount.mutateAsync({ code, type, value: parsedValue });
    setCode("");
    setValue("");
  }

  const errorMessage = createDiscount.error instanceof ApiError ? createDiscount.error.message : null;

  return (
    <form className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-slate-900">New discount code</h2>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Code" name="code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required />
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="type"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value as DiscountType)}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </div>
        <Input
          label={type === "PERCENTAGE" ? "Percent off" : "Amount off (USD)"}
          name="value"
          type="number"
          min="0"
          step={type === "PERCENTAGE" ? "1" : "0.01"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <Button type="submit" isLoading={createDiscount.isPending}>
        Create discount
      </Button>
    </form>
  );
}
