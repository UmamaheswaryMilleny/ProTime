import { container, type ClassProvider } from "tsyringe";
import type { IUserRepository } from "../../domain/repositoryInterface/user/user-repository-interface.js";
import { UserRepository } from "../repository/user/user-repository.js";
import type { IAdminRepository } from "../../domain/repositoryInterface/admin/admin-repository-interface.js";
import { AdminRepository } from "../repository/admin/admin-repository.js";
import type { IEmailService } from "../../domain/service-interfaces/email-service-interface.js";
import { EmailService } from "../service/email-service.js";
import type { ITokenService } from "../../domain/service-interfaces/token-service-interfaces.js";
import { TokenService } from "../service/token-service.js";
import type { IBlockedUserMiddleware } from "../../interface_adapter/interfaces/user/blocked-user-middleware-interface.js";
import { BlockedUserMiddleware } from "../../interface_adapter/middlewares/block-middleware.js";
import { TempUserService } from "../service/temp-user-service.js";
import  { OtpService } from "../service/otp-service.js";
import type { IOtpService } from "../../domain/service-interfaces/otp-service-interface.js";
import { GoogleAuthService } from "../service/google-auth-service.js";
import type { IGoogleAuthService } from "../../domain/service-interfaces/google-auth-service-interface.js";
import type { ITempUserService } from "../../domain/service-interfaces/temp-user-service-interface.js";
import type { IMulterService } from "../../domain/service-interfaces/multer-service.interface.js";
import { MulterService } from "../service/multer-service.js";

import { WinstonLoggerAdapter } from "../service/winston-logger-adaper.js";
import  type{ ILogger } from "../../domain/service-interfaces/logger.interface.js";
export class RepositoryRegister {
  static registerRepository(): void {
    container.register<IUserRepository>(
      "IUserRepository",
      { useClass: UserRepository } as ClassProvider<IUserRepository>
    );


    container.register<IAdminRepository>(
      "IAdminRepository",
      { useClass: AdminRepository } as ClassProvider<IAdminRepository>
    );

    container.register<IEmailService>(
      "IEmailService",
      { useClass: EmailService } as ClassProvider<IEmailService>
    );

  container.register<ILogger>(
  "ILogger",
  { useClass: WinstonLoggerAdapter } as ClassProvider<ILogger>
);


    container.register<ITokenService>(
      "ITokenService",
      { useClass: TokenService } as ClassProvider<ITokenService>
    );
 
    container.register<IOtpService>(
  "IOtpService",
  { useClass: OtpService } as ClassProvider<IOtpService>
);

container.register<IMulterService>(
  "IMulterService",
  { useClass: MulterService } as ClassProvider<IMulterService>
);

container.register<IGoogleAuthService>(
  "IGoogleAuthService",
  { useClass: GoogleAuthService } as ClassProvider<IGoogleAuthService>
);

container.register<ITempUserService>("ITempUserService", {
  useClass: TempUserService
} as ClassProvider<ITempUserService>);

  }
}