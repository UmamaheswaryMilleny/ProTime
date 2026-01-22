import { inject, injectable } from "tsyringe";
import type { IVerifyResetTokenUsecase } from "../../interfaces/auth/verify-reset-token-interface.js";
import type { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import type { JwtPayload } from "jsonwebtoken";
import { redisClient } from "../../../../infrastructure/config/redisConfig.js";

@injectable()
export class VerifyResetTokenUsecase implements IVerifyResetTokenUsecase {
  constructor(
    @inject("ITokenService")
    private _tokenService: ITokenService
  ) {}

  async execute(token: string): Promise<{ email: string; role: string }> {
    // Verify reset token
    const decoded = this._tokenService.verifyResetToken(token);

    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      throw new ValidationError("Invalid or expired reset token.");
    }

    const payload = decoded as JwtPayload & { id: string; email: string; role: string };

    // Check if token exists in Redis (single-use token)
    const tokenKey = `reset_token:${token}`;
    const storedUserId = await redisClient.get(tokenKey);

    if (!storedUserId) {
      throw new ValidationError("Reset token has already been used or expired.");
    }

    // Verify token belongs to the user
    if (storedUserId !== payload.id) {
      throw new ValidationError("Invalid reset token.");
    }

    return {
      email: payload.email,
      role: payload.role,
    };
  }
}
