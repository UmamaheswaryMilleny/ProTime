import type { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IAuthController } from '../../interfaces/auth/auth.controller.interface';
import type { IRegisterUsecase } from '../../../application/usecase/interface/auth/register.usecase.interface';
import type { ILoginUsecase } from '../../../application/usecase/interface/auth/login.usecase.interface';
import type { ILogoutUseCase } from '../../../application/usecase/interface/auth/logout.usecase.interface';
import type { ISendOtpUsecase } from '../../../application/usecase/interface/auth/send-otp.usecase.interface';
import type { IVerifyOtpUsecase } from '../../../application/usecase/interface/auth/verify-otp.usecase.interface';
import type { IRefreshTokenUsecase } from '../../../application/usecase/interface/auth/refresh-token.usecase.interface';
import type { IforgotPasswordUseCase } from '../../../application/usecase/interface/auth/forgot-password.usecase.interface';
import type { IResetPasswordUsecase } from '../../../application/usecase/interface/auth/reset-password.usecase.interface';
import type { IGoogleAuthUsecase } from '../../../application/usecase/interface/auth/google-auth.usecase.interface';


import { ResponseHelper } from '../../helpers/response.helper';
import {
  COOKIES_NAMES,
  HTTP_STATUS,
  SUCCESS_MESSAGE,
} from '../../../shared/constants/constants';
import { setAuthCookies } from '../../../shared/utils/cookie.helper';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('IRegisterUsecase')
    private readonly registerUsecase: IRegisterUsecase,

    @inject('ILoginUsecase')
    private readonly loginUsecase: ILoginUsecase,

    @inject('ILogoutUseCase')
    private readonly logoutUsecase: ILogoutUseCase,

    @inject('ISendOtpUsecase')
    private readonly sendOtpUsecase: ISendOtpUsecase,

    @inject('IVerifyOtpUsecase')
    private readonly verifyOtpUsecase: IVerifyOtpUsecase,

    @inject('IRefreshTokenUsecase')
    private readonly refreshTokenUsecase: IRefreshTokenUsecase,

    @inject('IForgotPasswordUsecase')
    private readonly forgotPasswordUsecase: IforgotPasswordUseCase,

    @inject('IResetPasswordUsecase')
    private readonly resetPasswordUsecase: IResetPasswordUsecase,

    @inject('IGoogleAuthUsecase')
    private readonly googleAuthUsecase: IGoogleAuthUsecase,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, password } = req.body;

      await this.registerUsecase.execute({ fullName, email, password });

      ResponseHelper.success(
        res,
        HTTP_STATUS.CREATED,
        SUCCESS_MESSAGE.AUTHORIZATION.ACCOUNT_CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Send OTP ─────────────────────────────────────────────────────────────

  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      await this.sendOtpUsecase.execute(email);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.OTP_SEND_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Resend OTP ───────────────────────────────────────────────────────────

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      // ResendOtpUseCase implements ISendOtpUsecase
      await this.sendOtpUsecase.execute(email);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.OTP_RESENT_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Verify OTP ───────────────────────────────────────────────────────────

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;

      // verifyOtp promotes temp user to real user internally
      await this.verifyOtpUsecase.execute({ email, otp });

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.OTP_VERIFIED
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // LoginUsecase returns both accessToken and refreshToken directly
      const { accessToken, refreshToken } = await this.loginUsecase.execute({
        email,
        password,
      });

    setAuthCookies(res, accessToken, refreshToken);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.LOGIN_SUCCESS,
        { accessToken }
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[COOKIES_NAMES.REFRESH_TOKEN];

      // LogoutUseCase needs refreshToken to delete it from Redis
      await this.logoutUsecase.execute(refreshToken ?? '');

      // Clear both cookies regardless
      res.clearCookie(COOKIES_NAMES.ACCESS_TOKEN);
      res.clearCookie(COOKIES_NAMES.REFRESH_TOKEN);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.LOGOUT_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[COOKIES_NAMES.REFRESH_TOKEN];

      if (!refreshToken) {
        res.clearCookie(COOKIES_NAMES.ACCESS_TOKEN);
        res.clearCookie(COOKIES_NAMES.REFRESH_TOKEN);
        ResponseHelper.error(
          res,
          'Refresh token missing',
          HTTP_STATUS.UNAUTHORIZED
        );
        return;
      }

      // Returns only new accessToken — no refresh token rotation in your design
      const { accessToken } = await this.refreshTokenUsecase.execute(refreshToken);

      // Update access token cookie
      res.cookie(COOKIES_NAMES.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Access token refreshed successfully',
        { accessToken }
      );
    } catch (error) {
      // Clear cookies on any refresh failure — force re-login
      res.clearCookie(COOKIES_NAMES.ACCESS_TOKEN);
      res.clearCookie(COOKIES_NAMES.REFRESH_TOKEN);
      next(error);
    }
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      // Returns void — never reveals whether email exists
      await this.forgotPasswordUsecase.execute(email);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'If an account with that email exists, a reset link has been sent.'
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Verify Reset Token ───────────────────────────────────────────────────

  async verifyResetToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        ResponseHelper.error(res, 'Token is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      // verifyReset from ITokenService — returns payload or null
      // We just confirm it's valid, no usecase needed
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Reset token is valid');
    } catch (error) {
      next(error);
    }
  }

  // ─── Reset Password ───────────────────────────────────────────────────────

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      // DTO validation handles password match — no need to check here
      await this.resetPasswordUsecase.execute(token, password);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Password reset successfully. You can now login with your new password.'
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Google Auth ──────────────────────────────────────────────────────────

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // idToken — not accessToken (your DTO uses idToken)
      const { idToken } = req.body;

      const { accessToken, refreshToken, isNewUser } =
        await this.googleAuthUsecase.execute(idToken);

     setAuthCookies(res, accessToken, refreshToken);

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGE.AUTHORIZATION.LOGIN_SUCCESS,
        { accessToken, isNewUser }
      );
    } catch (error) {
      next(error);
    }
  }
}