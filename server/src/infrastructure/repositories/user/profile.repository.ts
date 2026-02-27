import { injectable } from "tsyringe";
import type { Types } from "mongoose";
import { BaseRepository } from "../base.repository.js";
import { ProfileModel,type  ProfileDocument } from "../../database/models/profile.model.js";
import { ProfileMapper } from "../../database/mappers/profile.mapper.js";
import type { ProfileEntity } from "../../../domain/entities/profile.entity.js";
import type { IProfileRepository } from "../../../domain/repositories/profile/profile.repository.interface.js"; // ✅ correct path

// ✅ No local interface — removed entirely

@injectable() // ✅ implements domain interface
export class MongoProfileRepository
  extends BaseRepository<ProfileDocument, ProfileEntity>
  implements IProfileRepository
{
  constructor() {
    super(
      ProfileModel,
      ProfileMapper.toDomain,
      (data) =>
        ProfileMapper.toPersistence(
          data,
        ) as unknown as Partial<ProfileDocument>,
    );
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const doc = await this.model
      .findOne({ userId: userId as unknown as Types.ObjectId })
      .exec();
    if (!doc) return null;
    return ProfileMapper.toDomain(doc);
  }

  async updateByUserId(
    userId: string,
    data: Partial<ProfileEntity>,
  ): Promise<ProfileEntity | null> {
    const updateData = ProfileMapper.toPersistence(data);
    const doc = await this.model
      .findOneAndUpdate(
        { userId: userId as unknown as Types.ObjectId },
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    if (!doc) return null;
    return ProfileMapper.toDomain(doc);
  }

  async existsByUsername(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const filter: Record<string, unknown> = {
      username: username.toLowerCase().trim(),
    };
    if (excludeUserId) {
      filter.userId = { $ne: excludeUserId as unknown as Types.ObjectId };
    }
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }
}
