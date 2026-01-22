import type { IUserEntity } from '../../domain/entities/user.js';
import { UserProfileResponseDTO } from '../dto/response/user-profile-response-dto.js';

export class UserProfileMapper {
  static toDTO(user: IUserEntity): UserProfileResponseDTO {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio ?? undefined,
      location: user.location ?? undefined,
      profileImage: user.profileImage ?? undefined,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
