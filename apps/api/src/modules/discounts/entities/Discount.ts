import type { DiscountType } from "@pos/shared";

export interface Discount {
  id: string;
  organizationId: string;
  code: string;
  type: DiscountType;
  value: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountInput {
  organizationId: string;
  code: string;
  type: DiscountType;
  value: number;
}
