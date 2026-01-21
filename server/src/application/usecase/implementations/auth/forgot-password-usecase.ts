import { inject, injectable } from "tsyringe";
import type { IForgotPasswordUsecase } from "../../interfaces/auth/forgot-password-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IAdminRepository } from "../../../../domain/repositoryInterface/admin/admin-repository-interface.js";
import type  { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import type { IEmailService } from "../../../../domain/service-interfaces/email-service-interface.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import { ERROR_MESSAGE } from "../../../../shared/constants/constants.js";
import { redisClient } from "../../../../infrastructure/config/redisConfig.js";
import { config } from "../../../../shared/config.js";

@injectable()
export class ForgotPasswordUsecase implements IForgotPasswordUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("IAdminRepository")
    private _adminRepository: IAdminRepository,

    @inject("ITokenService")
    private _tokenService: ITokenService,

    @inject("IEmailService")
    private _emailService: IEmailService
  ) {}

  async execute(email: string, role?: string): Promise<void> {
    let user: { id: string; email: string; role: string; isBlocked: boolean } | null = null;

    // Find user based on role
    if (role === "admin") {
      const admin = await this._adminRepository.findByEmail(email);
      if (admin) {
        user = {
          id: admin._id,
          email: admin.email,
          role: "admin",
          isBlocked: admin.isBlocked,
        };
      }
    } else {
      // For client
      const foundUser = await this._userRepository.findByEmail(email);

      if (foundUser) {
        // If role is specified, verify it matches
        if (role && foundUser.role !== role) {
          throw new NotFoundError(ERROR_MESSAGE.AUTHENTICATION.EMAIL_NOT_FOUND);
        }
        user = {
          id: foundUser._id.toString(),
          email: foundUser.email,
          role: foundUser.role,
          isBlocked: foundUser.isBlocked,
        };
      }
    }

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGE.AUTHENTICATION.EMAIL_NOT_FOUND);
    }

    if (user.isBlocked) {
      throw new ValidationError("Your account has been blocked. Please contact support.");
    }

    // Generate reset token
    const resetToken = this._tokenService.generateResetToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store token in Redis with 10 minutes expiry (single-use token)
    const tokenKey = `reset_token:${resetToken}`;
    await redisClient.set(tokenKey, user.id, { EX: 600 }); // 10 minutes

    // Generate reset link
    const resetLink = `${config.client.URI}/reset-password?token=${resetToken}`;

    // Send email with reset link
    const emailHtml = this.getResetPasswordEmailHtml(resetLink);
    await this._emailService.sendMail(
      user.email,
      "Reset Your Password - ProTime",
      emailHtml
    );
  }

  private getResetPasswordEmailHtml(resetLink: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, sans-serif; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(to right, #4f46e5, #06b6d4); padding: 24px; color: white; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h2>
          <p style="margin: 8px 0 0; font-size: 14px;">Reset your ProTime account password</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Hi there 👋,</p>
          <p style="font-size: 15px; color: #555;">We received a request to reset your password for your ProTime account.</p>
          <p style="font-size: 15px; color: #555;">Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #aaa; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 6px;">${resetLink}</p>

          <p style="font-size: 14px; color: #888; margin-top: 24px;">⏰ This link is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
          
          <p style="font-size: 13px; color: #aaa; margin-top: 40px; text-align: center;">
            Cheers,<br/>The ProTime Team 🌍
          </p>
        </div>
      </div>
    `;
  }
}
