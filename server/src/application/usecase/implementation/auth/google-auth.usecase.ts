import { inject, injectable } from "tsyringe";
import type { IgoogleAuth } from "../../../service_interface/google-auth.service.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";
import type { ITokenService } from "../../../service_interface/token.service.interface";
import type { LoginResponseDTO } from "../../../dto/auth/response/login.response.dto";
import { UserRole, AuthProvider } from "../../../../domain/enums/user.enums";
import { UserBlockedError, UserDeletedError } from "../../../../domain/errors/user.error";
import type { IRefreshTokenStore } from "../../../service_interface/refresh-token-store-service.interface";
import type { IGoogleAuthUsecase } from "../../interface/auth/google-auth.usecase.interface";
import type { IProfileRepository } from "../../../../domain/repositories/profile/profile.repository.interface";
import type { IInitializeGamificationUsecase } from "../../interface/gamification/initialize.usecase.interface";
import type { IInitializeSubscriptionUsecase } from "../../interface/subscription/initialize-subscription.usecase.interface";

@injectable()
export default class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(
    @inject("UserRepository")
    private readonly userRepository: IUserRepository,

    @inject("SocialAuthPort")
    private readonly socialPort: IgoogleAuth,

    @inject("ITokenService")
    private readonly tokenPort: ITokenService,

    @inject("IRefreshTokenStore")
    private readonly refreshTokenStore: IRefreshTokenStore,

    @inject("ProfileRepository")
    private readonly profileRepository: IProfileRepository,

    @inject("IInitializeGamificationUsecase")
    private readonly initializeGamificationUsecase: IInitializeGamificationUsecase,

    @inject("IInitializeSubscriptionUsecase")
    private readonly initializeSubscriptionUsecase: IInitializeSubscriptionUsecase,
  ) { }

  async execute(idToken: string): Promise<LoginResponseDTO> {
    // 1. Verify Google ID token
    const googleUser = await this.socialPort.verifyToken(idToken);
    const { email, name, picture, googleId } = googleUser;

    // 2. Check if user already exists
    const existingUser =
      (await this.userRepository.findByEmail(email)) ||
      (await this.userRepository.findByGoogleID(googleId));

    let user = existingUser;

    // 3. Check if user is blocked or deleted
    if (user?.isBlocked) throw new UserBlockedError();
    if (user?.isDeleted) throw new UserDeletedError();

    let isNewUser = false;

    // 4. New user — create user, profile, and gamification
    if (!user) {
      const savedUser = await this.userRepository.save({
        email,
        fullName: name,
        isEmailVerified: true,
        authProvider: AuthProvider.GOOGLE,
        role: UserRole.CLIENT,
        isBlocked: false,
        isDeleted: false,
      });

      await this.profileRepository.save({
        userId: savedUser.id,
        fullName: name,
        username: `${email.split('@')[0]}_${Date.now()}`,
        profileImage: picture ?? undefined,
      });

      await this.initializeGamificationUsecase.execute(savedUser.id);
      await this.initializeSubscriptionUsecase.execute(savedUser.id);

      user = savedUser;
      isNewUser = true;
    }

    // 5. Existing user — update profile picture if they have none
    if (!isNewUser && picture) {
      const existingProfile = await this.profileRepository.findByUserId(user.id);
      if (existingProfile && !existingProfile.profileImage) {
        await this.profileRepository.updateByUserId(user.id, { profileImage: picture });
      }
    }

    // 6. Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium
    };

    const accessToken = this.tokenPort.generateAccess(payload);
    const refreshToken = this.tokenPort.generateRefresh(payload);

    await this.refreshTokenStore.save(user.id, refreshToken, 60 * 60 * 24 * 7);

    return {
      accessToken,
      refreshToken,
      isNewUser,
    };
  }
}