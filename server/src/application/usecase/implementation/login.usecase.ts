import { inject, injectable } from "tsyringe";
import type { ILoginUsecase } from "../interface/auth/login.usecase.interface.js";
import {
  InvalidPasswordError,
  UserDeletedError,
} from "../../../domain/errors/user.error.js";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface.js";
import type { IPasswordHasherService } from "../../service_interface/password-hasher.service.interface.js";
import type { LoginResponseDTO } from "../../dto/auth/response/login.response.dto.js";
import { UserNotFoundError } from "../../../domain/errors/user.error.js";
import { UserBlockedError } from "../../../domain/errors/user.error.js";
import type { ITokenService } from "../../service_interface/token.service.interface.js";
import type { IRefreshTokenStore } from "../../service_interface/refresh-token-store-service.interface.js";

@injectable()
export class LoginUsecase implements ILoginUsecase {
  constructor(
    @inject("UserRepository")
    private readonly userReposiroy: IUserRepository,
    @inject("ITokenService")
    private readonly tokenService: ITokenService,
    @inject("IPasswordHasherService")
    private readonly passwordHasherService: IPasswordHasherService,
    @inject("IRefreshTokenStore")
    private readonly refreshTokenStore: IRefreshTokenStore,
  ) {}

  async execute(data: {
    email: string;
    password: string;
  }): Promise<LoginResponseDTO> {
    const { email, password } = data;

    //1. Find user
    const user = await this.userReposiroy.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    //2. Check blocked or deleted
    if (user.isBlocked) {
      throw new UserBlockedError();
    }
    if (user.isDeleted) {
      throw new UserDeletedError();
    }

    //3. Verify passaword
    const isPasswordMatch = await this.passwordHasherService.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new InvalidPasswordError();
    }

    //4. Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccess(payload);
    const refreshToken = this.tokenService.generateRefresh(payload);
    await this.refreshTokenStore.save(user.id, refreshToken, 60 * 60 * 24 * 7); // 7 days
    //5. Return tokens
    return {
      accessToken,
      refreshToken,
    };
  }
}
