import { injectable } from "tsyringe";
import mongoose from "mongoose";
import { BaseRepository } from "../base.repository";
import { ProfileModel,type  ProfileDocument } from "../../database/models/profile.model";
import { ProfileMapper } from "../../database/mappers/profile.mapper";
import type { ProfileEntity } from "../../../domain/entities/profile.entity";
import type { IProfileRepository } from "../../../domain/repositories/profile/profile.repository.interface"; // ✅ correct path

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
      .findOne({ userId: new mongoose.Types.ObjectId(userId) })
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
        { userId: new mongoose.Types.ObjectId(userId) },
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
      filter.userId = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }

  async findByUserIds(userIds: string[]): Promise<ProfileEntity[]> {
    const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
    const docs = await this.model.find({ userId: { $in: objectIds } }).exec();
    return docs.map((doc) => ProfileMapper.toDomain(doc));
  }
}
