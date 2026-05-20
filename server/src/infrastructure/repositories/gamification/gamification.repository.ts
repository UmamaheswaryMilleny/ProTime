import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { IGamificationRepository } from '../../../domain/repositories/gamification/gamification.repository.interface';
import type { UserGamificationEntity } from '../../../domain/entities/gamification.entity';
import type { LevelTitle } from '../../../domain/enums/gamification.enums';
import { UserGamificationModel } from '../../database/models/user-gamification.model';
import { UserGamificationMapper } from '../../database/mappers/gamification.mapper';

@injectable()
export class MongoGamificationRepository implements IGamificationRepository {

  // ─── IBaseRepository ──────────────────────────────────────────────────────

  async save(
    data: Omit<UserGamificationEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserGamificationEntity> {
    const doc = await UserGamificationModel.create({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId), // explicit cast — consistent with other repos
    });
    return UserGamificationMapper.toDomain(doc);
  }

  async findById(id: string): Promise<UserGamificationEntity | null> {
    const doc = await UserGamificationModel.findById(id);
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async updateById(
    id:   string,
    data: Partial<UserGamificationEntity>,
  ): Promise<UserGamificationEntity | null> {
    const update = UserGamificationMapper.toPersistence(data);
    const doc    = await UserGamificationModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<void> {
    await UserGamificationModel.findByIdAndDelete(id);
  }

  // ─── IGamificationRepository ──────────────────────────────────────────────

  async findByUserId(userId: string): Promise<UserGamificationEntity | null> {
    const doc = await UserGamificationModel.findOne({ userId });
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async updateXpAndLevel(
    userId: string,
    data: {
      totalXp:      number;
      currentLevel: number;
      currentTitle: LevelTitle;
    },
  ): Promise<UserGamificationEntity | null> {
    const doc = await UserGamificationModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true },
    );
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async updateStreak(
    userId: string,
    data: {
      currentStreak:  number;
      longestStreak:  number;
      lastStreakDate: Date;
    },
  ): Promise<UserGamificationEntity | null> {
    const doc = await UserGamificationModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true },
    );
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async resetDailyCounters(userId: string): Promise<UserGamificationEntity | null> {
    // Resets all daily counters + stamps lastDailyResetDate = now
    // Called lazily on first dashboard load of each new day — no cron needed
    const doc = await UserGamificationModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          dailyXpEarned:         0,
          dailyChatMessageCount: 0,
          todayPomodoroUsed:     false,
          lastDailyResetDate:    new Date(),
        },
      },
      { new: true },
    );
    return doc ? UserGamificationMapper.toDomain(doc) : null;
  }

  async incrementDailyXpEarned(userId: string, xp: number): Promise<void> {
    // $inc is atomic — safe if two requests fire simultaneously
    await UserGamificationModel.updateOne(
      { userId },
      { $inc: { dailyXpEarned: xp } },
    );
  }

  async incrementDailyChatCount(userId: string): Promise<void> {
    await UserGamificationModel.updateOne(
      { userId },
      { $inc: { dailyChatMessageCount: 1 } },
    );
  }

  async markPomodoroUsedToday(userId: string): Promise<void> {
    // $set: true is idempotent — safe to call multiple times in a day
    await UserGamificationModel.updateOne(
      { userId },
      { $set: { todayPomodoroUsed: true } },
    );
  }

  async getLeaderboard(
    range: 'today' | 'weekly' | 'monthly' | 'allTime',
    type: 'global' | 'friends',
    limit: number
  ): Promise<import('../../../domain/entities/gamification.entity').LeaderboardEntry[]> {
    const sortField = range === 'today' ? 'dailyXpEarned' : 'totalXp';
    
    // Aggregation pipeline to filter real active users
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'userId',
          foreignField: 'userId',
          as: 'profileDoc',
        },
      },
      {
        // preserveNullAndEmptyArrays so we don't drop users if profile is missing
        $unwind: { path: '$profileDoc', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'userDoc.isDeleted': false,
          'userDoc.isBlocked': false,
          'userDoc.role': 'CLIENT',
        },
      },
      {
        $sort: { [sortField]: -1, currentStreak: -1 },
      },
      {
        $limit: limit,
      },
    ];

    const docs = await UserGamificationModel.aggregate(pipeline as any[]);

    return docs.map((doc: any) => ({
      userId: doc.userId.toString(),
      username: doc.profileDoc?.username || doc.userDoc.fullName || 'Unknown User',
      avatar: doc.profileDoc?.profileImage || '',
      totalXp: range === 'today' ? doc.dailyXpEarned : doc.totalXp,
      currentLevel: doc.currentLevel,
      currentTitle: doc.currentTitle,
      currentStreak: doc.currentStreak,
    }));
  }

  async getUserRank(
    userId: string,
    range: 'today' | 'weekly' | 'monthly' | 'allTime',
    type: 'global' | 'friends'
  ): Promise<number> {
    const doc = await UserGamificationModel.findOne({ userId });
    if (!doc) return 0;
    
    const sortField = range === 'today' ? 'dailyXpEarned' : 'totalXp';
    const userValue = range === 'today' ? doc.dailyXpEarned : doc.totalXp;
    
    const pipeline = [
      {
        $match: {
          $or: [
            { [sortField]: { $gt: userValue } },
            { [sortField]: userValue, currentStreak: { $gt: doc.currentStreak } },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        // Only count real users ahead of this user
        $match: {
          'userDoc.isDeleted': false,
          'userDoc.isBlocked': false,
          'userDoc.role': 'CLIENT',
        },
      },
      {
        $count: 'higherRankedCount',
      },
    ];

    const result = await UserGamificationModel.aggregate(pipeline as any[]);
    const higherRankedCount = result.length > 0 ? result[0].higherRankedCount : 0;
    
    return higherRankedCount + 1; // Rank is count of people ahead + 1
  }
}