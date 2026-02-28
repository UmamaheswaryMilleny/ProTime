import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";
import type { IPasswordHasherService } from "../../service_interface/password-hasher.service.interface";
import {
  InvalidTokenError,
  UserBlockedError,
  UserDeletedError,
  UserNotFoundError,
} from "../../../domain/errors/user.error";
import type { IResetPasswordUsecase } from "../interface/auth/reset-password.usecase.interface";
import type { ITokenService } from "../../service_interface/token.service.interface";
import type{ IRefreshTokenStore } from "../../service_interface/refresh-token-store-service.interface";
import type{ IResetTokenStore } from "../../service_interface/reset-token-store.service.interface";

@injectable()
export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,

    @inject("IPasswordHasherService")
    private readonly passwordHasher: IPasswordHasherService,
    @inject("ITokenService")
    private readonly tokenservice: ITokenService,
    @inject("IRefreshTokenStore")
    private readonly refreshTokenStore: IRefreshTokenStore,
    @inject("ResetTokenStore")
    private readonly resetTokenStore: IResetTokenStore,
  ) {}
  async execute(token: string, newPassword: string): Promise<void> {
    //1.Validate token

    const payload = this.tokenservice.verifyReset(token);
    if (!payload) {
      throw new InvalidTokenError();
    }
    if (!payload || !payload.id || !payload.email || !payload.role) {
      throw new InvalidTokenError();
    }

    //1. check if user exists in redis

    const exists = await this.resetTokenStore.exists(payload.id, token);
    if (!exists) {
      throw new InvalidTokenError();
    }

    //2. Check if user exists
    const user = await this.userRepository.findById(payload.id);
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

    //4. Hash and update password
    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePassword(payload.id, passwordHash);
    await this.refreshTokenStore.deleteAll(user.id);
    await this.resetTokenStore.delete(payload.id);
  }
}
