import type { ProfileEntity } from "../../domain/entities/profile.entity";
import { UserProfileResponseDTO } from "../dto/user/response/user-profile.response.dto";

export class ProfileMapper {
  static toProfileResponse(
    profile: ProfileEntity,
    user: { id: string; email: string; fullName: string }
  ): UserProfileResponseDTO {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      bio: profile.bio,
      country: profile.country,
      profileImage: profile.profileImage,
      createdAt: profile.createdAt,
    };
  }
}
