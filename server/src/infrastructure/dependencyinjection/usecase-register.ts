import { container } from "tsyringe";
import { RegisterUsecase } from "../../application/usecase/implementations/auth/register-usecase.js";
import { LoginUsecase } from "../../application/usecase/implementations/auth/login-usercase.js";
import { AdminLoginUsecase } from "../../application/usecase/implementations/auth/admin-login-usecase.js";
import { SendOtpUsecase } from "../../application/usecase/implementations/auth/sendotp-usecase.js";
import { ResendOtpUsecase } from "../../application/usecase/implementations/auth/resendOtp-usecase.js";
import { VerifyOtpUsecase } from "../../application/usecase/implementations/auth/verifyotp-usecase.js";
import { VerifyOtpAndCreateUserUsecase } from "../../application/usecase/implementations/auth/verifycreatinguser-usecase.js";
import { CheckUserAndSendOtpUsecase } from "../../application/usecase/implementations/checkUserAndSendOtpUsecase.js";
import { GenerateTokenUseCase } from "../../application/usecase/implementations/auth/generateTokenUsecase.js";
import { LogoutUseCase } from "../../application/usecase/implementations/auth/logout-usecase.js";
import { GetAllUsersUsecase } from "../../application/usecase/implementations/admin/get-all-users-usecase.js";
import { GetUserDetailsUsecase } from "../../application/usecase/implementations/admin/get-user-detail-usecase.js";
import { BlockUnblockUserUsecase } from "../../application/usecase/implementations/admin/block-unblock-user-usecase.js";
import { RefreshTokenUsecase } from "../../application/usecase/implementations/auth/refresh-token-usecase.js";
import { VerifyResetTokenUsecase } from "../../application/usecase/implementations/auth/verify-reset-token-usecase.js";
import { GoogleAuthUsecase } from "../../application/usecase/implementations/auth/google-auth-usecase.js";
import { ResetPasswordUsecase } from "../../application/usecase/implementations/auth/reset-password-usecase.js";
import { GetUserProfileUsecase } from "../../application/usecase/implementations/user/get-user-profile-usecase.js";
import { ForgotPasswordUsecase } from "../../application/usecase/implementations/auth/forgot-password-usecase.js";


import type { IGetAllUsersUsecase } from "../../application/usecase/interfaces/admin/getallusers-interface.js";
import type { IGetUserDetailsUsecase } from "../../application/usecase/interfaces/admin/get-user-details-interface.js";
import type { ICheckUserAndSendOtpUsecase } from "../../application/usecase/interfaces/check-user-verify-usecase-interface.js";

import type { IBlockUnblockUserUsecase } from "../../application/usecase/interfaces/admin/blockUnblock-interface.js";
import type { IRefreshTokenUsecase } from "../../application/usecase/interfaces/auth/refresh-token-usecase-interface.js";
import type { IGenerateTokenUseCase } from "../../application/usecase/interfaces/auth/generate-token-usecase-interface.js";
import type { ILogoutUseCase } from "../../application/usecase/interfaces/auth/logout-usecase-interface.js";
import type { IForgotPasswordUsecase } from "../../application/usecase/interfaces/auth/forgot-password-interface.js";
import type  { IResetPasswordUsecase } from "../../application/usecase/interfaces/auth/reset-password-interface.js";
import type { IVerifyResetTokenUsecase } from "../../application/usecase/interfaces/auth/verify-reset-token-interface.js";


import type { IGoogleAuthUsecase } from "../../application/usecase/interfaces/auth/google-auth-interface.js";
import type { IGetUserProfileUsecase } from "../../application/usecase/interfaces/user/get-user-profile-usecase-interface.js";
import { UserController } from "../../interface_adapter/controllers/user/user-profile-controller.js";
import { BlockedUserMiddleware } from "../../interface_adapter/middlewares/block-middleware.js";

export class UsecaseRegistory {
  static registerUsecase(): void {
    container.register("IRegisterUsecase", {
      useClass: RegisterUsecase,
    });

    container.register("ILoginUsecase", {
      useClass: LoginUsecase,
    });

 
    container.register("IAdminLoginUsecase", {
      useClass: AdminLoginUsecase,
    });

    container.register("ISendOtpUsecase", {
      useClass: SendOtpUsecase,
    });

    container.register("IResendOtpUsecase", {
      useClass: ResendOtpUsecase,
    });

    container.register("IVerifyOtpUsecase", {
      useClass: VerifyOtpUsecase,
    });

    container.register("IVerifyOtpAndCreateUserUsecase", {
      useClass: VerifyOtpAndCreateUserUsecase,
    });

 
    container.register<ICheckUserAndSendOtpUsecase>(
      "ICheckUserAndSendOtpUsecase",
      {
        useClass: CheckUserAndSendOtpUsecase,
      }
    );

    container.register<IGenerateTokenUseCase>("IGenerateTokenUseCase", {
      useClass: GenerateTokenUseCase,
    });

    container.register<ILogoutUseCase>("ILogoutUseCase", {
      useClass: LogoutUseCase,
    });

    // Admin use cases
    container.register<IGetAllUsersUsecase>("IGetAllUsersUsecase", {
      useClass: GetAllUsersUsecase,
    });

    container.register<IGetUserDetailsUsecase>("IGetUserDetailsUsecase", {
      useClass: GetUserDetailsUsecase,
    });

    container.register<IBlockUnblockUserUsecase>("IBlockUnblockUserUsecase", {
      useClass: BlockUnblockUserUsecase,
    });

    container.register<IRefreshTokenUsecase>("IRefreshTokenUsecase", {
      useClass: RefreshTokenUsecase,
    });



    // Forgot Password use cases
    container.register<IForgotPasswordUsecase>("IForgotPasswordUsecase", {
      useClass: ForgotPasswordUsecase,
    });

    container.register<IResetPasswordUsecase>("IResetPasswordUsecase", {
      useClass: ResetPasswordUsecase,
    });

    container.register<IVerifyResetTokenUsecase>("IVerifyResetTokenUsecase", {
      useClass: VerifyResetTokenUsecase,
    });

    // Google Authentication use case
    container.register<IGoogleAuthUsecase>("IGoogleAuthUsecase", {
      useClass: GoogleAuthUsecase,
    });

    container.register<IGetUserProfileUsecase>(
      "IGetUserProfileUsecase",
      {
        useClass:GetUserProfileUsecase,
      }
    )
    container.register("IUserController",{
       useClass:UserController,
    })
    container.register("IBlockedUserMiddleware",{
      useClass:BlockedUserMiddleware,
    })
  }
}