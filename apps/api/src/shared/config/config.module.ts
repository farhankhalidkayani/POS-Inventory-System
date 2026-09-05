import { Global, Module } from "@nestjs/common";
import { loadEnv } from "./env.js";
import { ENV } from "../di/tokens.js";

@Global()
@Module({
  providers: [{ provide: ENV, useValue: loadEnv() }],
  exports: [ENV],
})
export class ConfigModule {}
