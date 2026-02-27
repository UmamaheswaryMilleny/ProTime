import { container } from 'tsyringe';

// Use case implementations
import { RegisterUsecase } from '../../application/usecase/implementation/register.usecase.js';
import { LoginUsecase } from '../../application/usecase/implementation/login.usecase.js';
import { LogoutUseCase } from '../../application/usecase/implementation/logout.usecase.js';
import { VerifyOtpUseCase } from '../../application/usecase/implementation/verify-otp.usecase.js';
import { ResendOtpUseCase } from '../../application/usecase/implementation/resend-otp.usecase.js';
import { RefreshTokenUseCase } from '../../application/usecase/implementation/refresh-token.usecase.js';
import { ForgotPasswordUsecase } from '../../application/usecase/implementation/forgot-password.usecase.js';
import { ResetPasswordUsecase } from '../../application/usecase/implementation/reset-password.usecase.js';
import GoogleAuthUsecase from '../../application/usecase/implementation/google-auth.usecase.js';

// Use case interfaces
import type { IRegisterUsecase } from '../../application/usecase/interface/auth/register.usecase.interface.js';
import type { ILogoutUseCase } from '../../application/usecase/interface/auth/logout.usecase.interface.js';
import type { ILoginUsecase } from '../../application/usecase/interface/auth/login.usecase.interface.js';
import type { IVerifyOtpUsecase } from '../../application/usecase/interface/auth/verify-otp.usecase.interface.js';
import type { ISendOtpUsecase } from '../../application/usecase/interface/auth/send-otp.usecase.interface.js';
import type { IRefreshTokenUsecase } from '../../application/usecase/interface/auth/refresh-token.usecase.interface.js';
import type { IforgotPasswordUseCase } from '../../application/usecase/interface/auth/forgot-password.usecase.interface.js';
import type { IResetPasswordUsecase } from '../../application/usecase/interface/auth/reset-password.usecase.interface.js';
import type { IGoogleAuthUsecase } from '../../application/usecase/interface/auth/google-auth.usecase.interface.js';

export class UsecaseRegistry {
  static register(): void {
    // ─── Auth Use Cases ───────────────────────────────────────────────
    container.register<IRegisterUsecase>('IRegisterUsecase', {
      useClass: RegisterUsecase,
    });

    container.register<ILoginUsecase>('ILoginUsecase', {
      useClass: LoginUsecase,
    });

    container.register<ILogoutUseCase>('ILogoutUseCase', {
      useClass: LogoutUseCase,
    });

    container.register<IVerifyOtpUsecase>('IVerifyOtpUsecase', {
      useClass: VerifyOtpUseCase,
    });

    container.register<ISendOtpUsecase>('ISendOtpUsecase', {
      useClass: ResendOtpUseCase,
    });

    container.register<IRefreshTokenUsecase>('IRefreshTokenUsecase', {
      useClass: RefreshTokenUseCase,
    });

    container.register<IforgotPasswordUseCase>('IForgotPasswordUsecase', {
      useClass: ForgotPasswordUsecase,
    });

    container.register<IResetPasswordUsecase>('IResetPasswordUsecase', {
      useClass: ResetPasswordUsecase,
    });

    container.register<IGoogleAuthUsecase>('IGoogleAuthUsecase', {
      useClass: GoogleAuthUsecase,
    });
  }
}