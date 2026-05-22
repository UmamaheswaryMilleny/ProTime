import type { ProfileEntity } from "../../domain/entities/profile.entity";
import { UserProfileResponseDTO } from "../dto/user/response/user-profile.response.dto";

export class ProfileMapper {
  static toProfileResponse(
    profile: ProfileEntity,
    user: { id: string; email: string; fullName: string },
    averageRating?: number,
    ratingCount?: number,
  ): UserProfileResponseDTO {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      bio: profile.bio,
      username:profile.username,
      country: profile.country,
      languages:profile.languages,
      profileImage: profile.profileImage,
      skills: profile.skills ?? [],
      averageRating,
      ratingCount,
      createdAt: profile.createdAt.toISOString(),
    };
  }
}
