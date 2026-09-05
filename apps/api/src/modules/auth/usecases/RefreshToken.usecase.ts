import { Inject, Injectable } from "@nestjs/common";
import { UnauthorizedError } from "../../../shared/errors/AppError.js";
import { USERS_REPOSITORY } from "../../../shared/di/tokens.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";
import { TokenService } from "../../../shared/security/token.service.js";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.usersRepository.findById(payload.organizationId, payload.userId);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });
    const nextRefreshToken = this.tokenService.signRefreshToken({
      userId: user.id,
      organizationId: user.organizationId,
    });

    return { accessToken, refreshToken: nextRefreshToken };
  }
}
