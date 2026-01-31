import type { Request, Response } from "express";

import { inject, injectable } from "tsyringe";

import type { IRegisterUsecase } from "../../../application/usecase/interfaces/auth/register-usecase-interface.js";
import type { IAuthController } from "../../interfaces/auth/auth-controller-interface.js";
import { ResponseHelper } from "../../../infrastructure/config/helper/response-helper.js";
import {
  COOKIES_NAMES,
  ERROR_MESSAGE,
  HTTP_STATUS,
  SUCCESS_MESSAGE,
} from "../../../shared/constants/constants.js";


import type { ILoginUsecase } from "../../../application/usecase/interfaces/auth/loginUsecase-interface.js";
import { LoginRequestDTO } from "../../../application/dto/request/login-request-dto.js";
import type  { AdminLoginRequestDTO } from "../../../application/dto/request/adminlogin-request-dto.js";
import type { IAdminLoginUsecase } from "../../../application/usecase/interfaces/auth/adminloginUseCase-interface.js";
import type { ISendOtpUsecase } from "../../../application/usecase/interfaces/auth/send-otp-usecase-interface.js";
import type { IResendOtpUsecase } from "../../../application/usecase/interfaces/auth/resend-otp-usecase-interface.js";
import type { IVerifyOtpAndCreateUserUsecase } from "../../../application/usecase/interfaces/auth/verify-otp-user_usecase-interface.js";
import type { IVerifyOtpUsecase } from "../../../application/usecase/interfaces/auth/verify-otp-usecase-interface.js";
import type { ICheckUserAndSendOtpUsecase } from "../../../application/usecase/interfaces/check-user-verify-usecase-interface.js";
import type { IGenerateTokenUseCase } from "../../../application/usecase/interfaces/auth/generate-token-usecase-interface.js";
import type { ILogoutUseCase } from "../../../application/usecase/interfaces/auth/logout-usecase-interface.js";
import type { IRefreshTokenUsecase } from "../../../application/usecase/interfaces/auth/refresh-token-usecase-interface.js";
import { setAuthCookies , clearCookie, updateCookieWithAccessToken} from "../../../shared/utils/cookieHelper.js";
import type { IForgotPasswordUsecase } from "../../../application/usecase/interfaces/auth/forgot-password-interface.js";
import type { IResetPasswordUsecase } from "../../../application/usecase/interfaces/auth/reset-password-interface.js";
import type { IVerifyResetTokenUsecase } from "../../../application/usecase/interfaces/auth/verify-reset-token-interface.js";
import type { IGoogleAuthUsecase } from "../../../application/usecase/interfaces/auth/google-auth-interface.js";
import type { IGetCurrentUserUsecase } from "../../../application/usecase/interfaces/auth/get-current-user-interface.js";
import type { CustomRequest } from "../../middlewares/auth-middleware.js";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("IRegisterUsecase")
    private _registerUsecase: IRegisterUsecase,

    @inject("ILoginUsecase")
    private _loginUsecase: ILoginUsecase,

    @inject("IAdminLoginUsecase")
    private _loginAdminUsecase: IAdminLoginUsecase,

    @inject("ISendOtpUsecase")
    private _sendOtpUsecase: ISendOtpUsecase,

    @inject("IResendOtpUsecase")
    private _resendOtpUsecase: IResendOtpUsecase,

    @inject("IVerifyOtpUsecase")
    private _verifyOtpUsecase: IVerifyOtpUsecase,

    @inject("IVerifyOtpAndCreateUserUsecase")
    private _verifyOtpAndCreateUserUsecase: IVerifyOtpAndCreateUserUsecase,

    @inject("ICheckUserAndSendOtpUsecase")
    private _checkUserAndSendOtpUsecase: ICheckUserAndSendOtpUsecase,

    @inject("IGenerateTokenUseCase")
    private _generateTokenUseCase: IGenerateTokenUseCase,

    @inject("ILogoutUseCase")
    private _logoutUseCase: ILogoutUseCase,

    @inject("IRefreshTokenUsecase")
    private _refreshTokenUsecase: IRefreshTokenUsecase,

    @inject("IForgotPasswordUsecase")
    private _forgotPasswordUsecase: IForgotPasswordUsecase,

    @inject("IResetPasswordUsecase")
    private _resetPasswordUsecase: IResetPasswordUsecase,

    @inject("IVerifyResetTokenUsecase")
    private _verifyResetTokenUsecase: IVerifyResetTokenUsecase,

    @inject("IGoogleAuthUsecase")
    private _googleAuthUsecase: IGoogleAuthUsecase,
    
    @inject("IGetCurrentUserUsecase")
    private _getCurrentUserUsecase: IGetCurrentUserUsecase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    await this._registerUsecase.execute(userData);

    ResponseHelper.success(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGE.AUTHORIZATION.ACCOUNT_CREATED
    );
  }

  async login(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    const data = await this._loginUsecase.execute(userData as LoginRequestDTO);
   console.log("data----->",data)
    const userId = data.id.toString();
     console.log(userId,"userid-------->")
    const tokens = await this._generateTokenUseCase.execute(
      userId,
      data.email,
      data.role
    );
    console.log(tokens,"---->tokens")

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      COOKIES_NAMES.ACCESS_TOKEN,
      COOKIES_NAMES.REFRESH_TOKEN
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGE.AUTHORIZATION.LOGIN_SUCCESS,
      user: {
        id: userData,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }


  async AdminLogin(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const data = await this._loginAdminUsecase.execute(
      userData as AdminLoginRequestDTO
    );
    const userId = data.id.toString();

    const tokens = await this._generateTokenUseCase.execute(
      userId,
      data.email,
      data.role
    );

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      COOKIES_NAMES.ACCESS_TOKEN,
      COOKIES_NAMES.REFRESH_TOKEN
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGE.AUTHORIZATION.LOGIN_SUCCESS,
      user: {
        id: userData,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    await this._sendOtpUsecase.execute(email);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGE.AUTHORIZATION.OTP_SEND_SUCCESS
    );
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    await this._resendOtpUsecase.execute(email);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGE.AUTHORIZATION.OTP_RESENT_SUCCESS
    );
  }
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    await this._verifyOtpUsecase.execute(email, otp);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGE.AUTHORIZATION.OTP_VERIFIED
    );
  }
  async verifyOtpAndCreateUser(req: Request, res: Response): Promise<void> {
    // const { email, otp, userData } = req.body;
    const { email, otp} = req.body;
    const user = await this._verifyOtpAndCreateUserUsecase.execute(
      email,
      otp,
      // userData
    );

    ResponseHelper.success(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGE.AUTHORIZATION.ACCOUNT_CREATED,
      user
    );
  }


  async signupSendOtp(req: Request, res: Response): Promise<void> {
    const { email} = req.body;

    await this._checkUserAndSendOtpUsecase.execute({
      email,
   
    });

    ResponseHelper.success(res, HTTP_STATUS.OK, "OTP sent successfully");
  }

  async logout(req: Request, res: Response): Promise<void> {
    await this._logoutUseCase.execute();

    clearCookie(
      res,
      COOKIES_NAMES.ACCESS_TOKEN,
      COOKIES_NAMES.REFRESH_TOKEN
    );

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGE.AUTHORIZATION.LOGOUT_SUCCESS
    );
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[COOKIES_NAMES.REFRESH_TOKEN];

    if (!refreshToken) {
      clearCookie(
        res,
        COOKIES_NAMES.ACCESS_TOKEN,
        COOKIES_NAMES.REFRESH_TOKEN
      );
      ResponseHelper.error(
        res,
        ERROR_MESSAGE.AUTHENTICATION.TOKEN_MISSING,
        HTTP_STATUS.UNAUTHORIZED
      );
      return;
    }

    try {
      const result = await this._refreshTokenUsecase.execute(refreshToken);

      updateCookieWithAccessToken(
        res,
        result.accessToken,
        COOKIES_NAMES.ACCESS_TOKEN
      );

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        "Access token refreshed successfully",
        {
          role: result.role,
        }
      );
    } catch (error) {
      // Clear cookies on refresh failure
      clearCookie(
        res,
        COOKIES_NAMES.ACCESS_TOKEN,
        COOKIES_NAMES.REFRESH_TOKEN
      );

      if (error instanceof Error) {
        ResponseHelper.error(
          res,
          error.message,
          HTTP_STATUS.UNAUTHORIZED
        );
      } else {
        ResponseHelper.error(
          res,
          ERROR_MESSAGE.AUTHENTICATION.TOKEN_EXPIRED_REFRESH,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }
  }





  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email, role } = req.body;

    await this._forgotPasswordUsecase.execute(email, role);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      "Password reset link has been sent to your email. Please check your inbox."
    );
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      ResponseHelper.error(
        res,
        "Passwords do not match",
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    await this._resetPasswordUsecase.execute(token, password);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      "Password reset successfully. You can now login with your new password."
    );
  }

  async verifyResetToken(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      ResponseHelper.error(
        res,
        "Token is required",
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    const result = await this._verifyResetTokenUsecase.execute(token);

    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      "Reset token is valid",
      result
    );
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const { accessToken } = req.body;
   console.log(accessToken,"---->,accesstoken")
    const userData = await this._googleAuthUsecase.execute(accessToken);
    console.log(userData,"----->,userData")
    const userId = userData.id.toString();
      console.log(userId,"----->,useriddddddddd")
    const tokens = await this._generateTokenUseCase.execute(
      userId,
      userData.email,
      userData.role
    );
    console.log(tokens,"----->,useriddddddddd")
    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      COOKIES_NAMES.ACCESS_TOKEN,
      COOKIES_NAMES.REFRESH_TOKEN
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGE.AUTHORIZATION.LOGIN_SUCCESS,
      user: {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }


  async getMe(req: Request, res: Response): Promise<void> {
    const authUser = (req as CustomRequest).user;
    if (!authUser?.id) {
      ResponseHelper.error(
        res,
        ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
        HTTP_STATUS.UNAUTHORIZED,
      );
      return;
    }

    const currentUser = await this._getCurrentUserUsecase.execute(authUser.id);
    ResponseHelper.success(
      res,
      HTTP_STATUS.OK,
      "Current user retrieved successfully",
      currentUser,
    );
  }

}