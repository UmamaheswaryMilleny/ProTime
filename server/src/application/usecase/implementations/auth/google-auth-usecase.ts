import { inject, injectable } from "tsyringe";
import type { IGoogleAuthUsecase } from "../../interfaces/auth/google-auth-interface.js";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IGoogleAuthService } from "../../../../domain/service-interfaces/google-auth-service-interface.js";
import type { ITokenService } from "../../../../domain/service-interfaces/token-service-interfaces.js";
import type { LoginResponseDTO } from "../../../dto/response/login-response-dto.js";
import { NotFoundError } from "../../../../domain/errors/notFoundError.js";
import { ValidationError } from "../../../../domain/errors/validationError.js";
import { ERROR_MESSAGE } from "../../../../shared/constants/constants.js";
import { UserMapper } from "../../../mapper/user-mapper.js";
import { hashPassword } from "../../../../shared/utils/bcryptHelper.js";

@injectable()
export class GoogleAuthUsecase implements IGoogleAuthUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository,

    @inject("IGoogleAuthService")
    private _googleAuthService: IGoogleAuthService,

    @inject("ITokenService")
    private _tokenService: ITokenService
  ) {}

  async execute(accessToken: string): Promise<LoginResponseDTO> {
    // Verify Google ID token
    const googleUser = await this._googleAuthService.verifyToken(accessToken);
    console.log(googleUser,"---->googleuser")
      
    // Find user by email
    let user = await this._userRepository.findByEmail(googleUser.email);

    

    // If user doesn't exist, create new user (auto-signup for Google users)
    if (!user) {
      // Generate a random password (user won't need it for Google login)
      const randomPassword = Math.random().toString(36).slice(-12) + "A1@";
      const hashedPassword = await hashPassword(randomPassword);

      // Extract first and last name from Google name
      const nameParts = googleUser.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Create new user with Google data
      user = await this._userRepository.save({
        firstName,
        lastName,
        email: googleUser.email,
        password: hashedPassword,
        role: "client", // Only client role can use Google auth
        isBlocked: false,
        profileImage: googleUser.picture,
      });
    } else {
      // User exists - verify it's a client role
      if (user.role !== "client") {
        throw new ValidationError(
          "Google authentication is only available for client accounts. Please use your regular login."
        );
      }

      // Check if user is blocked
      if (user.isBlocked) {
        throw new ValidationError(
          "Your account has been blocked. Please contact support."
        );
      }

      // Update profile image if available and not set
      if (googleUser.picture && !user.profileImage) {
        await this._userRepository.updateById(user._id, {
          profileImage: googleUser.picture,
        });
        user.profileImage = googleUser.picture;
      }
    }

    return UserMapper.mapToLoginResponseDto(user);
  }
}
