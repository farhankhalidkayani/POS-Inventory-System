"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ApiError } from "../../../shared/api/httpClient";
import { useCategories } from "../hooks/useCategories";
import { useCreateCategory } from "../hooks/useCreateCategory";
import { useCreateProduct } from "../hooks/useCreateProduct";

const INITIAL_FORM_STATE = {
  sku: "",
  name: "",
  priceDollars: "",
  categoryId: "",
  barcode: "",
};

export function ProductForm() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const createProduct = useCreateProduct();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [newCategoryName, setNewCategoryName] = useState("");

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    const category = await createCategory.mutateAsync({ name: newCategoryName.trim() });
    setNewCategoryName("");
    setForm((prev) => ({ ...prev, categoryId: category.id }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const priceCents = Math.round(Number.parseFloat(form.priceDollars) * 100);
    await createProduct.mutateAsync({
      sku: form.sku,
      name: form.name,
      priceCents,
      categoryId: form.categoryId || undefined,
      barcode: form.barcode || undefined,
    });
    setForm(INITIAL_FORM_STATE);
  }

  const errorMessage =
    createProduct.error instanceof ApiError
      ? createProduct.error.message
      : createCategory.error instanceof ApiError
        ? createCategory.error.message
        : null;

  return (
    <form className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-slate-900">Add product</h2>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="SKU"
          name="sku"
          value={form.sku}
          onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
          required
        />
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (USD)"
          name="priceDollars"
          type="number"
          step="0.01"
          min="0"
          value={form.priceDollars}
          onChange={(event) => setForm((prev) => ({ ...prev, priceDollars: event.target.value }))}
          required
        />
        <Input
          label="Barcode (optional)"
          name="barcode"
          value={form.barcode}
          onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="categoryId"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={form.categoryId}
          onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
        >
          <option value="">No category</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="New category"
            name="newCategoryName"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleCreateCategory} isLoading={createCategory.isPending}>
          Add category
        </Button>
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <Button type="submit" isLoading={createProduct.isPending}>
        Create product
      </Button>
    </form>
  );
}
