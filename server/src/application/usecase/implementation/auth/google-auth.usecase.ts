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
import type { UserEntity } from "../../../../domain/entities/user.entity";

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
  ) {}

  async execute(idToken: string): Promise<LoginResponseDTO> {
    // 1. Verify Google ID token
    const googleUser = await this.socialPort.verifyToken(idToken);
    const { email, name, picture, googleId } = googleUser;

    // 2. Check if user already exists
    const existingUser =
      (await this.userRepository.findByEmail(email)) ||
      (await this.userRepository.findByGoogleID(googleId));

    // 3. Check if user is blocked or deleted
    if (existingUser?.isBlocked) throw new UserBlockedError();
    if (existingUser?.isDeleted) throw new UserDeletedError();

    let user: UserEntity;
    let isNewUser = false;

    // 4. New user — create user, profile, and gamification
    if (!existingUser) {
      const savedUser = await this.userRepository.save({
        email,
        fullName: name || 'User',
        isEmailVerified: true,
        authProvider: AuthProvider.GOOGLE,
        role: UserRole.CLIENT,
        isBlocked: false,
        isDeleted: false,
        googleId, 
      } as any);

      await this.profileRepository.save({
        userId: savedUser.id,
        fullName: name || 'User',
        username: `${email.split('@')[0]}_${Date.now()}`,
        profileImage: picture ?? undefined,
      });

      await this.initializeGamificationUsecase.execute(savedUser.id);

      user = savedUser;
      isNewUser = true;
    } else {
      user = existingUser;

      // 5. Existing user — synchronize name and link googleId if missing
      const updates: any = {};
      if (!user.googleId) updates.googleId = googleId;
      
      const shouldUpdateUserName = name && (!user.fullName || user.fullName === 'User');
      if (shouldUpdateUserName) updates.fullName = name;

      if (Object.keys(updates).length > 0) {
        const updatedUser = await this.userRepository.updateById(user.id, updates);
        if (updatedUser) {
          user = updatedUser;
        }
      }

      const existingProfile = await this.profileRepository.findByUserId(user.id);
      if (existingProfile) {
        const profileUpdates: any = {};
        const shouldUpdateProfileName = name && (!existingProfile.fullName || existingProfile.fullName === 'User');
        if (shouldUpdateProfileName) profileUpdates.fullName = name;
        if (picture && !existingProfile.profileImage) profileUpdates.profileImage = picture;

        if (Object.keys(profileUpdates).length > 0) {
          await this.profileRepository.updateByUserId(user.id, profileUpdates);
        }
      }
    }

    // 6. Generate tokens
    const profile = await this.profileRepository.findByUserId(user.id);
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      username: profile?.username || user.email.split('@')[0],
      isPremium: user.isPremium,
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