import { inject, injectable } from "tsyringe";
import type { IGoogleAuthUsecase } from "../interface/auth/google-auth.usecase.interface";
import type { IgoogleAuth } from "../../service_interface/google-auth.service.interface";
import type { IUserRepository } from "../../../domain/repositories/user/user.repository.interface";
import type { ITokenService } from "../../service_interface/token.service.interface";
import type { LoginResponseDTO } from "../../dto/auth/response/login.response.dto";
import { AuthProvider, UserRole } from "../../../domain/enums/user.enums";
import {
  UserBlockedError,
  UserDeletedError,
} from "../../../domain/errors/user.error";
import type { IRefreshTokenStore } from "../../service_interface/refresh-token-store-service.interface";

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
  ) {}

  async execute(idToken: string): Promise<LoginResponseDTO> {
    //1. Verify google ID token
    const googleUser = await this.socialPort.verifyToken(idToken);
    const { email, name, picture, googleId } = googleUser;

    //2. Check if user already exists
    let existingUser =
      (await this.userRepository.findByEmail(email)) ||
      (await this.userRepository.findByGoogleID(googleId));

    let user = existingUser;
    //4. Check if user is blocked
    if (user?.isBlocked) {
      throw new UserBlockedError();
    }

    //4. Check if user is deleted
    if (user?.isDeleted) {
      throw new UserDeletedError();
    }

    let isNewUser = false;

    //3. If user doesn't exist, create new user (auto-signup for Google users)
    if (!user) {
      user = await this.userRepository.save({
        email,
        fullName: name,
        isEmailVerified: true,
        authProvider: AuthProvider.GOOGLE,
        role: UserRole.CLIENT,
        isBlocked: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      isNewUser = true;
    }


//     // For NEW Google users — create profile with picture
// if (!user) {
//   const savedUser: UserEntity = await this.userRepository.save({ ... });

//   await this.profileRepository.save({
//     userId: savedUser.id,
//     fullName: name,
//     username: `${email.split('@')[0]}_${Date.now()}`,
//     profileImage: picture ?? undefined,
//   });

//   user = savedUser;
//   isNewUser = true;
// }

// // For EXISTING Google users — only update picture if they have none
// if (!isNewUser && picture) {
//   const existingProfile = await this.profileRepository.findByUserId(user.id);
  
//   if (existingProfile && !existingProfile.profileImage) {
//     await this.profileRepository.updateByUserId(user.id, {
//       profileImage: picture,
//     });
//   }
// }
    

    //5. Generate access and refresh tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
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
