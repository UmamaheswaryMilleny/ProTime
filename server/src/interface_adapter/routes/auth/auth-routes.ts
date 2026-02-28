import { injectable } from "tsyringe";
import { container } from "tsyringe";

import { BaseRoute } from "../base-route";
import { asyncHandler } from "../../../shared/asyncHandler";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { verifyAuth } from "../../middlewares/auth.middleware";

import { AuthController } from "../../controllers/auth/auth-controller";

// DTOs for validation
import { RegisterRequestDTO } from "../../../application/dto/auth/request/register.request.dto";
import { LoginRequestDTO } from "../../../application/dto/auth/request/login.request.dto";
import { SendOtpRequestDTO } from "../../../application/dto/auth/request/sent-otp.request.dto";
import { VerifyOtpRequestDTO } from "../../../application/dto/auth/request/verify-otp.request.dto";
import { ForgotPasswordRequestDTO } from "../../../application/dto/auth/request/forgot-password.request.dto";
import { ResetPasswordRequestDTO } from "../../../application/dto/auth/request/reset-password.request.dto";
import { GoogleAuthRequestDTO } from "../../../application/dto/auth/request/google-auth.request.dto";

@injectable()
export class AuthRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(AuthController);

    // ─── Registration Flow ────────────────────────────────────────────

    // Step 1: Submit registration data → stores temp user + sends OTP
    this.router.post(
      "/register",
      validationMiddleware(RegisterRequestDTO),
      asyncHandler(ctrl.register.bind(ctrl)),
    );

    // Step 2: Send OTP (first time)
    this.router.post(
      "/send-otp",
      validationMiddleware(SendOtpRequestDTO),
      asyncHandler(ctrl.sendOtp.bind(ctrl)),
    );

    // Step 3: Resend OTP if expired
    this.router.post(
      "/resend-otp",
      validationMiddleware(SendOtpRequestDTO),
      asyncHandler(ctrl.resendOtp.bind(ctrl)),
    );

    // Step 4: Verify OTP → promotes temp user to real user
    this.router.post(
      "/verify-otp",
      validationMiddleware(VerifyOtpRequestDTO),
      asyncHandler(ctrl.verifyOtp.bind(ctrl)),
    );

    // ─── Login / Logout ───────────────────────────────────────────────

    this.router.post(
      "/login",
      validationMiddleware(LoginRequestDTO),
      asyncHandler(ctrl.login.bind(ctrl)),
    );

    // Logout — requires valid refresh token in cookie
    this.router.post(
      "/logout",
      verifyAuth,
      asyncHandler(ctrl.logout.bind(ctrl)),
    );

    // ─── Token Management ─────────────────────────────────────────────

    // Silent refresh — called by frontend when access token expires
    this.router.post(
      "/refresh-token",
      asyncHandler(ctrl.refreshToken.bind(ctrl)),
    );

    // ─── Password Reset Flow ──────────────────────────────────────────

    // Step 1: Request reset link
    this.router.post(
      "/forgot-password",
      validationMiddleware(ForgotPasswordRequestDTO),
      asyncHandler(ctrl.forgotPassword.bind(ctrl)),
    );

    // Step 2: Verify reset token is valid (called when user clicks link)
    this.router.get(
      "/verify-reset-token",
      asyncHandler(ctrl.verifyResetToken.bind(ctrl)),
    );

    // Step 3: Submit new password
    this.router.post(
      "/reset-password",
      validationMiddleware(ResetPasswordRequestDTO),
      asyncHandler(ctrl.resetPassword.bind(ctrl)),
    );

    // ─── Google OAuth ─────────────────────────────────────────────────

    this.router.post(
      "/google",
      validationMiddleware(GoogleAuthRequestDTO),
      asyncHandler(ctrl.googleAuth.bind(ctrl)),
    );
  }
}
