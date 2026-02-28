import type { UserEntity } from "../../../domain/entities/user.entity";
import type { UserDocument } from "../models/user.model";

export class UserMapper {
  
   //Converts a Mongoose UserDocument → domain UserEntity
   // This is the ONLY place raw DB data enters the domain
   
  static toDomain(doc: UserDocument): UserEntity {
    return {
      id: (doc._id as { toString(): string }).toString(),
      fullName: doc.fullName,
      email: doc.email,
      passwordHash: doc.passwordHash ?? "",
      role: doc.role,
      authProvider: doc.authProvider,
      isEmailVerified: doc.isEmailVerified,
      isBlocked: doc.isBlocked,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // Converts a partial UserEntity → plain object safe for Mongoose
   // googleId is infrastructure-only — handled separately in repository
   
  static toPersistence(
    data: Partial<UserEntity> & { googleId?: string }, //& means intersection type becasue googleId is NOT part of UserEntity
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.fullName !== undefined) result.fullName = data.fullName;
    if (data.email !== undefined) result.email = data.email;
    if (data.passwordHash !== undefined)
      result.passwordHash = data.passwordHash;
    if (data.role !== undefined) result.role = data.role;
    if (data.authProvider !== undefined)
      result.authProvider = data.authProvider;
    if (data.isEmailVerified !== undefined)
      result.isEmailVerified = data.isEmailVerified;
    if (data.isBlocked !== undefined) result.isBlocked = data.isBlocked;
    if (data.isDeleted !== undefined) result.isDeleted = data.isDeleted;

    // googleId is schema-only — never on UserEntity, passed separately
    if (data.googleId !== undefined) result.googleId = data.googleId;

    return result;
  }
}
