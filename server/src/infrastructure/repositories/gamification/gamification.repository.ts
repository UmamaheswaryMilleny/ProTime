import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { IGamificationRepository } from '../../../domain/repositories/gamification/gamification.repository.interface';
import type { UserGamificationEntity } from '../../../domain/entities/gamification.entity';
import { LevelTitle, FREE_MAX_LEVEL, getTitleForLevel } from '../../../domain/enums/gamification.enums';
import { UserGamificationModel } from '../../database/models/user-gamification.model';
import { UserGamificationMapper } from '../../database/mappers/gamification.mapper';
import { BuddyConnectionModel } from '../../database/models/buddy-connection.model';

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
    limit: number,
    userId?: string
  ): Promise<import('../../../domain/entities/gamification.entity').LeaderboardEntry[]> {
    const sortField = range === 'today' ? 'dailyXpEarned' : 'totalXp';
    
    let buddyIds: string[] = [];
    if (type === 'friends' && userId) {
      const connections = await BuddyConnectionModel.find({
        status: 'CONNECTED',
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { buddyId: new mongoose.Types.ObjectId(userId) }
        ]
      });
      buddyIds = connections.map(conn => 
        conn.userId.toString() === userId ? conn.buddyId.toString() : conn.userId.toString()
      );
      buddyIds.push(userId);
    }

    // Aggregation pipeline to filter real active users
    const pipeline: any[] = [];

    if (type === 'friends' && userId) {
      pipeline.push({
        $match: {
          userId: { $in: buddyIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      });
    }

    pipeline.push(
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
      }
    );

    const docs = await UserGamificationModel.aggregate(pipeline);

    return docs.map((doc: any) => {
      const isPremium = doc.userDoc?.isPremium || false;
      const rawLevel = doc.currentLevel;
      const currentLevel = !isPremium && rawLevel > FREE_MAX_LEVEL ? FREE_MAX_LEVEL : rawLevel;
      const currentTitle = !isPremium && rawLevel > FREE_MAX_LEVEL ? getTitleForLevel(FREE_MAX_LEVEL) : doc.currentTitle;

      return {
        userId: doc.userId.toString(),
        username: doc.profileDoc?.username || doc.userDoc.fullName || 'Unknown User',
        avatar: doc.profileDoc?.profileImage || '',
        totalXp: range === 'today' ? doc.dailyXpEarned : doc.totalXp,
        currentLevel,
        currentTitle,
        currentStreak: doc.currentStreak,
      };
    });
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
    
    let buddyIds: string[] = [];
    if (type === 'friends') {
      const connections = await BuddyConnectionModel.find({
        status: 'CONNECTED',
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { buddyId: new mongoose.Types.ObjectId(userId) }
        ]
      });
      buddyIds = connections.map(conn => 
        conn.userId.toString() === userId ? conn.buddyId.toString() : conn.userId.toString()
      );
      buddyIds.push(userId);
    }

    const matchConditions: any = {
      $or: [
        { [sortField]: { $gt: userValue } },
        { [sortField]: userValue, currentStreak: { $gt: doc.currentStreak } },
      ],
    };

    if (type === 'friends') {
      matchConditions.userId = { $in: buddyIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const pipeline = [
      {
        $match: matchConditions,
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