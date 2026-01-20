import { injectable } from "tsyringe";
import { asyncHandler } from "../../../shared/async-handler.js";
import { BaseRoute } from "../base-route.js";
import {
  authController,

} from "../../../infrastructure/dependencyinjection/resolve.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { RegisterRequestDTO } from "../../../application/dto/request/register-request-dto.js";

import { SendOtpRequestDTO } from "../../../application/dto/request/sentOtpRequest-dto.js";
import { VerifyOtpRequestDTO } from "../../../application/dto/request/verifyotp-request-dto.js";

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
  





  }
}