import { Global, Module } from "@nestjs/common";
import { ENV } from "../di/tokens.js";
import type { Env } from "../config/env.js";
import { AuthGuard } from "./auth.guard.js";
import { RolesGuard } from "./roles.guard.js";
import { TokenService } from "./token.service.js";

@Global()
@Module({
  providers: [
    {
      provide: TokenService,
      useFactory: (env: Env) =>
        new TokenService({
          accessSecret: env.JWT_ACCESS_SECRET,
          refreshSecret: env.JWT_REFRESH_SECRET,
          accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
          refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }),
      inject: [ENV],
    },
    AuthGuard,
    RolesGuard,
  ],
  exports: [TokenService, AuthGuard, RolesGuard],
})
export class SecurityModule {}
