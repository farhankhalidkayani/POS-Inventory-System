import { Module } from "@nestjs/common";
import { PAYMENT_PROVIDER } from "../../shared/di/tokens.js";
import { MockPaymentProvider } from "./services/MockPaymentProvider.js";

@Module({
  providers: [{ provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider }],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
