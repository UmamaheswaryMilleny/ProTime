import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface.js";
import type { IEmailService } from "../../service_interface/email.service.interface.js";
import type { IResetTokenStore } from "../../service_interface/reset-token-store.service.interface.js";
import { UserNotFoundError } from "../../../domain/errors/user.error.js";
import { UserBlockedError } from "../../../domain/errors/user.error.js";
import type { IforgotPasswordUseCase } from "../interface/auth/forgot-password.usecase.interface.js";
import { UserDeletedError } from "../../../domain/errors/user.error.js";
import { mailContentProvider } from "../../../shared/mailContentProvider.js";
import { MAIL_CONTENT_PURPOSE } from "../../../shared/constants/constants.js";
import type { ITokenService } from "../../service_interface/token.service.interface.js";
import { config } from "../../../shared/config/index.js";

@injectable()
export class ForgotPasswordUsecase implements IforgotPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,
 @inject("ResetTokenStore")
    private readonly resetTokenStore: IResetTokenStore,
    @inject("IEmailService")
    private readonly emailPort: IEmailService,
    @inject("ITokenService")
    private readonly tokenPort:ITokenService
  ) {}
  async execute(email: string): Promise<void> {
    //1. Check if user exists
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    //2. Check if user is blocked
    if (user.isBlocked) {
      throw new UserBlockedError();
    }

    //3. Check user is deleted
    if (user.isDeleted) {
      throw new UserDeletedError();
    }
   //4. Generate reset token
    const resetToken = this.tokenPort.generateReset({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    //5. Store token in Redis 

    await this.resetTokenStore.save(
      user.id,
      resetToken,
      60 * 5 // 5 minutes
    );

    // Generate reset link
    const resetLink = `${config.client.URI}/reset-password?token=${resetToken}`;

    //6. Send reset password email
    await this.emailPort.sendMail(
      email,
      "Reset your ProTime password",
      mailContentProvider(MAIL_CONTENT_PURPOSE.RESET, resetLink),
    );
   
  }
}
