import { injectable } from "tsyringe";
import { asyncHandler } from "../../../shared/async-handler.js";
import { BaseRoute } from "../base-route.js";
import {
  authController,
  blockedUserMiddleware,
} from "../../../infrastructure/dependencyinjection/resolve.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { LoginRequestDTO } from "../../../application/dto/request/login-request-dto.js";
import { RegisterRequestDTO } from "../../../application/dto/request/register-request-dto.js";
import { AdminLoginRequestDTO } from "../../../application/dto/request/adminlogin-request-dto.js";
import { ResendOtpUsecase } from "../../../application/usecase/implementations/auth/resendOtp-usecase.js";
import { SendOtpRequestDTO } from "../../../application/dto/request/sentOtpRequest-dto.js";
import { VerifyOtpRequestDTO } from "../../../application/dto/request/verifyotp-request-dto.js";
import { ForgotPasswordRequestDTO } from "../../../application/dto/request/forgot-password-request-dto.js";
import { ResetPasswordRequestDTO } from "../../../application/dto/request/reset-password-request-dto.js";
import { VerifyResetTokenRequestDTO } from "../../../application/dto/request/verify-reset-token-request-dto.js";
import { GoogleAuthRequestDTO } from "../../../application/dto/request/google-auth-request-dto.js";

@injectable()
export class AuthRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post(
      "/register",
      validationMiddleware(RegisterRequestDTO),
      asyncHandler(authController.register.bind(authController))
    );
    this.router.post(
      "/login",
      validationMiddleware(LoginRequestDTO),
      asyncHandler(authController.login.bind(authController))
    );
  



    this.router.post(
      "/admin/login",
      validationMiddleware(AdminLoginRequestDTO),
      asyncHandler(authController.AdminLogin.bind(authController))
    );
    this.router.post(
      "/send-otp",
      validationMiddleware(SendOtpRequestDTO),
      asyncHandler(authController.signupSendOtp.bind(authController))
    );

    this.router.post(
      "/resend-otp",
      asyncHandler(authController.resendOtp.bind(authController))
    );

    this.router.post(
      "/verify-otp",
      validationMiddleware(VerifyOtpRequestDTO),
      asyncHandler(authController.verifyOtp.bind(authController))
    );

    this.router.post(
      "/verify-createuser",

      asyncHandler(authController.verifyOtpAndCreateUser.bind(authController))
    );
  

    this.router.post(
      "/logout",
      asyncHandler(authController.logout.bind(authController))
    );

    this.router.post(
      "/refresh-token",
      asyncHandler(authController.refreshToken.bind(authController))
    );

 

    this.router.post(
      "/forgot-password",
      validationMiddleware(ForgotPasswordRequestDTO),
      asyncHandler(authController.forgotPassword.bind(authController))
    );

    this.router.post(
      "/reset-password",
      validationMiddleware(ResetPasswordRequestDTO),
      asyncHandler(authController.resetPassword.bind(authController))
    );

    this.router.get(
      "/verify-reset-token",
      validationMiddleware(VerifyResetTokenRequestDTO),
      asyncHandler(authController.verifyResetToken.bind(authController))
    );

    this.router.post(
      "/google",
      // validationMiddleware(GoogleAuthRequestDTO),
      asyncHandler(authController.googleAuth.bind(authController))
    );

    // this.router.get(
    //   "/profile",
    //   asyncHandler(userController.getProfile.bind(userController))
    // );
  }
}