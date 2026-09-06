import type { CreateSupplierRequest, SupplierResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const suppliersApi = {
  listSuppliers(accessToken: string): Promise<SupplierResponse[]> {
    return apiFetch<SupplierResponse[]>("/api/suppliers", { accessToken });
  },

  createSupplier(accessToken: string, input: CreateSupplierRequest): Promise<SupplierResponse> {
    return apiFetch<SupplierResponse>("/api/suppliers", { method: "POST", accessToken, body: input });
  },
};
