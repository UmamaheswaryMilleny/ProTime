import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { IBadgeDefinitionRepository } from '../../../domain/repositories/gamification/gamification.repository.interface';
import type { BadgeDefinitionEntity, UserBadgeEntity } from '../../../domain/entities/badge.entity';
import type { BadgeCategory } from '../../../domain/enums/gamification.enums';
import { BadgeDefinitionModel } from '../../database/models/badge.model';
import { UserBadgeModel } from '../../database/models/badge.model';
import { BadgeDefinitionMapper, UserBadgeMapper } from '../../database/mappers/gamification.mapper';
import { IUserBadgeRepository } from '../../../domain/repositories/gamification/gamification.repository.interface';
// ─── MongoBadgeDefinitionRepository ──────────────────────────────────────────
@injectable()
export class MongoBadgeDefinitionRepository implements IBadgeDefinitionRepository {

  // ─── IBaseRepository ──────────────────────────────────────────────────────

  async save(
    data: Omit<BadgeDefinitionEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BadgeDefinitionEntity> {
    const doc = await BadgeDefinitionModel.create(data);
    return BadgeDefinitionMapper.toDomain(doc);
  }

  async findById(id: string): Promise<BadgeDefinitionEntity | null> {
    const doc = await BadgeDefinitionModel.findById(id);
    return doc ? BadgeDefinitionMapper.toDomain(doc) : null;
  }

  async updateById(
    id:   string,
    data: Partial<BadgeDefinitionEntity>,
  ): Promise<BadgeDefinitionEntity | null> {
    const doc = await BadgeDefinitionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    return doc ? BadgeDefinitionMapper.toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<void> {
    await BadgeDefinitionModel.findByIdAndDelete(id);
  }

  // ─── IBadgeDefinitionRepository ───────────────────────────────────────────

  async findByKey(key: string): Promise<BadgeDefinitionEntity | null> {
    const doc = await BadgeDefinitionModel.findOne({ key });
    return doc ? BadgeDefinitionMapper.toDomain(doc) : null;
  }

  async findAllActive(): Promise<BadgeDefinitionEntity[]> {
    // sorted by category — groups TASK/STREAK/BUDDY/ROOM together in gallery
    const docs = await BadgeDefinitionModel.find({ isActive: true }).sort({ category: 1 });
    return docs.map(BadgeDefinitionMapper.toDomain);
  }

  async findByCategory(category: BadgeCategory): Promise<BadgeDefinitionEntity[]> {
    const docs = await BadgeDefinitionModel.find({ category, isActive: true });
    return docs.map(BadgeDefinitionMapper.toDomain);
  }
}

// ─── MongoUserBadgeRepository ─────────────────────────────────────────────────
@injectable()
export class MongoUserBadgeRepository implements IUserBadgeRepository {

  // ─── IBaseRepository ──────────────────────────────────────────────────────

  async save(
    data: Omit<UserBadgeEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserBadgeEntity> {
    const doc = await UserBadgeModel.create({
      ...data,
      userId:            new mongoose.Types.ObjectId(data.userId),
      badgeDefinitionId: new mongoose.Types.ObjectId(data.badgeDefinitionId),
    });
    return UserBadgeMapper.toDomain(doc);
  }

  async findById(id: string): Promise<UserBadgeEntity | null> {
    const doc = await UserBadgeModel.findById(id);
    return doc ? UserBadgeMapper.toDomain(doc) : null;
  }

  async updateById(
    id:   string,
    data: Partial<UserBadgeEntity>,
  ): Promise<UserBadgeEntity | null> {
    const update = UserBadgeMapper.toPersistence(data);
    const doc    = await UserBadgeModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    return doc ? UserBadgeMapper.toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<void> {
    await UserBadgeModel.findByIdAndDelete(id);
  }

  // ─── IUserBadgeRepository ─────────────────────────────────────────────────

  async findAllByUserId(userId: string): Promise<UserBadgeEntity[]> {
    // sorted newest first — most recently earned badge shows first in gallery
    const docs = await UserBadgeModel.find({ userId }).sort({ earnedAt: -1 });
    return docs.map(UserBadgeMapper.toDomain);
  }

  async findByUserIdAndBadgeKey(
    userId:   string,
    badgeKey: string,
  ): Promise<UserBadgeEntity | null> {
    // uses compound index { userId, badgeKey } — O(1) lookup
    const doc = await UserBadgeModel.findOne({ userId, badgeKey });
    return doc ? UserBadgeMapper.toDomain(doc) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    return UserBadgeModel.countDocuments({ userId });
  }
}