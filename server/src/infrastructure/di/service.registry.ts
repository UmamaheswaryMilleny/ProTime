import { container } from 'tsyringe';

// Domain interfaces
import type { IUserRepository } from '../../domain/repositories/user/user.repository.interface.js';
import type { IEmailService } from '../../application/service_interface/email.service.interface.js';
import type { ITokenService } from '../../application/service_interface/token.service.interface.js';
import type { IOtpService } from '../../application/service_interface/otp.service.interface.js';
import type { IPasswordHasherService } from '../../application/service_interface/password-hasher.service.interface.js';
import type { ITempUserService } from '../../application/service_interface/temp-user.service.interface.js';
import type { IRefreshTokenStore } from '../../application/service_interface/refresh-token-store-service.interface.js';
import type { IResetTokenStore } from '../../application/service_interface/reset-token-store.service.interface.js';
import type { IgoogleAuth } from '../../application/service_interface/google-auth.service.interface.js';
import type { ILoggerService } from '../../application/service_interface/logger.service.interface.js';

// Infrastructure implementations
import { MongoUserRepository } from '../repositories/user/user.repository.js';
import { NodemailerEmailService } from '../service/email-service.js';
import { JwtTokenService } from '../service/token-service.js';
import { OtpService } from '../service/otp-service.js';
import { PasswordHasherService } from '../service/password-service.js';
import { TempUserService } from '../service/temp-user-service.js';
import { RedisRefreshTokenStore } from '../service/refresh-token-store.js';
import { RedisResetTokenStore } from '../service/reset-token.store.js';
import { GoogleAuthService } from '../service/auth-service.js';
import { WinstonLoggerAdapter } from '../service/logger-service.js';
import type { IProfileRepository } from '../../domain/repositories/profile/profile.repository.interface.js';
import { MongoProfileRepository } from '../repositories/user/profile.repository.js';

export class ServiceRegistry {
  static register(): void {
    // ─── Repositories ────────────────────────────────────────────────
    container.register<IUserRepository>('UserRepository', {
      useClass: MongoUserRepository,
    });

    // ─── Auth Services ────────────────────────────────────────────────
    container.register<ITokenService>('ITokenService', {
      useClass: JwtTokenService,
    });

    container.register<IPasswordHasherService>('IPasswordHasherService', {
      useClass: PasswordHasherService,
    });

    container.register<IgoogleAuth>('SocialAuthPort', {
      useClass: GoogleAuthService,
    });

    // ─── Token Stores ─────────────────────────────────────────────────
    container.register<IRefreshTokenStore>('IRefreshTokenStore', {
      useClass: RedisRefreshTokenStore,
    });

    container.register<IResetTokenStore>('ResetTokenStore', {
      useClass: RedisResetTokenStore,
    });

    // ─── OTP & Temp User ──────────────────────────────────────────────
    container.register<IOtpService>('IOtpService', {
      useClass: OtpService,
    });

    container.register<ITempUserService>('ITempUserService', {
      useClass: TempUserService,
    });

    // ─── Email ────────────────────────────────────────────────────────
    container.register<IEmailService>('IEmailService', {
      useClass: NodemailerEmailService,
    });

    // ─── Logger ───────────────────────────────────────────────────────
    container.register<ILoggerService>('ILoggerService', {
      useClass: WinstonLoggerAdapter,
    });
    container.register<IProfileRepository>('ProfileRepository', {
  useClass: MongoProfileRepository,
});
  }
}