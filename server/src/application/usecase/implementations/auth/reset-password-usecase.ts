import { inject, injectable } from "tsyringe";
import type { IResetPasswordUsecase } from "../../interfaces/auth/reset-password-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IAdminRepository } from "../../../../domain/repositoryInterface/admin/admin-repository-interface.js";
import type { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import { ERROR_MESSAGE } from "../../../../shared/constants/constants.js";
import { hashPassword } from "../../../../shared/utils/bcryptHelper.js";
import { redisClient } from "../../../../infrastructure/config/redisConfig.js";
import type { JwtPayload } from "jsonwebtoken";

@injectable()
export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("IAdminRepository")
    private _adminRepository: IAdminRepository,

    @inject("ITokenService")
    private _tokenService: ITokenService
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    // Verify reset token
    const decoded = this._tokenService.verifyResetToken(token);

    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      throw new ValidationError("Invalid or expired reset token. Please request a new password reset.");
    }

    const payload = decoded as JwtPayload & { id: string; email: string; role: string };

    // Check if token exists in Redis (single-use token)
    const tokenKey = `reset_token:${token}`;
    const storedUserId = await redisClient.get(tokenKey);

    if (!storedUserId) {
      throw new ValidationError("Reset token has already been used or expired. Please request a new password reset.");
    }

    // Verify token belongs to the user
    if (storedUserId !== payload.id) {
      throw new ValidationError("Invalid reset token.");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password based on role
    if (payload.role === "admin") {
      const admin = await this._adminRepository.findById(payload.id);
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      await this._adminRepository.updatePassword(payload.id, hashedPassword);
    } else {
      // For client
      const user = await this._userRepository.findById(payload.id);
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGE.AUTHENTICATION.USER_NOT_FOUND);
      }
      await this._userRepository.updatePassword(payload.id, hashedPassword);
    }

    // Delete token from Redis (single-use)
    await redisClient.del(tokenKey);
  }
}
