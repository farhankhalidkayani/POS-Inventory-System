import type { ChargeInput, ChargeResult, PaymentProvider } from "./PaymentProvider.js";

/**
 * Stand-in for a real payment gateway (Stripe, Square, etc). Always succeeds so
 * the checkout flow can be exercised end to end without external credentials.
 * Swap the DI binding in PaymentsModule for a real provider when one is needed.
 */
export class MockPaymentProvider implements PaymentProvider {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    return {
      success: true,
      transactionId: `mock_${input.method.toLowerCase()}_${input.referenceId}`,
    };
  }
}
