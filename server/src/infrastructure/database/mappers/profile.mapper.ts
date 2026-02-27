import type { ProfileEntity } from "../../../domain/entities/profile.entity.js";
import type { ProfileDocument } from "../models/profile.model.js";

export class ProfileMapper {
  
   //Converts a Mongoose ProfileDocument → domain ProfileEntity

  static toDomain(doc: ProfileDocument): ProfileEntity {
    return {
      userId: doc.userId.toString(),
      fullName: doc.fullName,
      username: doc.username,
      bio: doc.bio ?? undefined,
      country: doc.country ?? undefined,
      languages: doc.languages ?? [],
      profileImage: doc.profileImage ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  
   //Converts a partial ProfileEntity → plain object safe for Mongoose
   
  static toPersistence(data: Partial<ProfileEntity>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId !== undefined) result.userId = data.userId;
    if (data.fullName !== undefined) result.fullName = data.fullName;
    if (data.username !== undefined) result.username = data.username;
    if (data.bio !== undefined) result.bio = data.bio;
    if (data.country !== undefined) result.country = data.country;
    if (data.languages !== undefined) result.languages = data.languages;
    if (data.profileImage !== undefined)
      result.profileImage = data.profileImage;

    return result;
  }
}
