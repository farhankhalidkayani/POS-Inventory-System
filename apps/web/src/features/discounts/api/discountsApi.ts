import type { CreateDiscountRequest, DiscountResponse } from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const discountsApi = {
  listDiscounts(accessToken: string): Promise<DiscountResponse[]> {
    return apiFetch<DiscountResponse[]>("/api/discounts", { accessToken });
  },

  createDiscount(accessToken: string, input: CreateDiscountRequest): Promise<DiscountResponse> {
    return apiFetch<DiscountResponse>("/api/discounts", { method: "POST", accessToken, body: input });
  },
};
