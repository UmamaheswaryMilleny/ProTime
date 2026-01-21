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

  

    container.register<ITokenService>(
      "ITokenService",
      { useClass: TokenService } as ClassProvider<ITokenService>
    );
 
  }
}