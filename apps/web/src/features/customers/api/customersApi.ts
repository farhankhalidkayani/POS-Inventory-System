import type { CreateCustomerRequest, CustomerResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const customersApi = {
  listCustomers(accessToken: string): Promise<CustomerResponse[]> {
    return apiFetch<CustomerResponse[]>("/api/customers", { accessToken });
  },

  createCustomer(accessToken: string, input: CreateCustomerRequest): Promise<CustomerResponse> {
    return apiFetch<CustomerResponse>("/api/customers", { method: "POST", accessToken, body: input });
  },
};
