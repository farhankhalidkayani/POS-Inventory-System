import type { PaymentMethod } from "@pos/shared";

export interface ChargeInput {
  amountCents: number;
  method: PaymentMethod;
  referenceId: string;
}

export interface ChargeResult {
  success: boolean;
  transactionId: string;
}

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
