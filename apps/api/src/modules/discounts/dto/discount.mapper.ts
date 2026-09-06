import type { DiscountResponse } from "@pos/shared";
import type { Discount } from "../entities/Discount.js";

export function toDiscountResponse(discount: Discount): DiscountResponse {
  return { id: discount.id, code: discount.code, type: discount.type, value: discount.value, active: discount.active };
}
