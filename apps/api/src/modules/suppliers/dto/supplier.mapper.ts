import type { SupplierResponse } from "@pos/shared";
import type { Supplier } from "../entities/Supplier.js";

export function toSupplierResponse(supplier: Supplier): SupplierResponse {
  return {
    id: supplier.id,
    name: supplier.name,
    contactEmail: supplier.contactEmail,
    contactPhone: supplier.contactPhone,
  };
}
