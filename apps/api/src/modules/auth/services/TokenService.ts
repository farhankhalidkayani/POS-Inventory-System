import jwt from "jsonwebtoken";
import type { Role } from "@pos/shared";

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
  organizationId: string;
}

export interface TokenServiceConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export class TokenService {
  constructor(private readonly config: TokenServiceConfig) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiresIn,
    } as jwt.SignOptions);
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, this.config.accessSecret) as AccessTokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, this.config.refreshSecret) as RefreshTokenPayload;
  }
}
