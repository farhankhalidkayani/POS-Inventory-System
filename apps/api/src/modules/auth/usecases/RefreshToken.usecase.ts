import { UnauthorizedError } from "../../../shared/errors/AppError.js";
import type { UsersRepository } from "../../users/repositories/users.repository.js";
import type { TokenService } from "../services/TokenService.js";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
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
