
import { container } from 'tsyringe';

// Domain interfaces
import type { IUserRepository } from '../../domain/repositories/user/user.repository.interface';
import type { IEmailService } from '../../application/service_interface/email.service.interface';
import type { ITokenService } from '../../application/service_interface/token.service.interface';
import type { IOtpService } from '../../application/service_interface/otp.service.interface';
import type { IPasswordHasherService } from '../../application/service_interface/password-hasher.service.interface';
import type { ITempUserService } from '../../application/service_interface/temp-user.service.interface';
import type { IRefreshTokenStore } from '../../application/service_interface/refresh-token-store-service.interface';
import type { IResetTokenStore } from '../../application/service_interface/reset-token-store.service.interface';
import type { IgoogleAuth } from '../../application/service_interface/google-auth.service.interface';
import type { ILoggerService } from '../../application/service_interface/logger.service.interface';

// Infrastructure implementations
import { MongoUserRepository } from '../repositories/user/user.repository';
import { NodemailerEmailService } from '../service/email-service';
import { JwtTokenService } from '../service/token-service';
import { OtpService } from '../service/otp-service';
import { PasswordHasherService } from '../service/password-service';
import { TempUserService } from '../service/temp-user-service';
import { RedisRefreshTokenStore } from '../service/refresh-token-store';
import { RedisResetTokenStore } from '../service/reset-token.store';
import { GoogleAuthService } from '../service/auth-service';
import { WinstonLoggerAdapter } from '../service/logger-service';
import type { IProfileRepository } from '../../domain/repositories/profile/profile.repository.interface';
import { MongoProfileRepository } from '../repositories/user/profile.repository';

//Todo
import type { ITodoRepository } from '../../domain/repositories/todo/todo.repository.interface';
import { MongoTodoRepository } from '../repositories/todo.repository';
import type { ICloudinaryService } from '../../application/service_interface/cloudinary.service.interface';
import { CloudinaryService } from '../service/cloudinary-service';

//upload service
export class ServiceRegistry {
  static register(): void {
    // ─── Repositories ────────────────────────────────────────────────
    container.register<IUserRepository>('UserRepository', {
      useClass: MongoUserRepository,
    });
    container.register<ITodoRepository>('ITodoRepository', {
      useClass: MongoTodoRepository,
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

    container.register<ICloudinaryService>('ICloudinaryService', {
  useClass: CloudinaryService,
});
  }
}