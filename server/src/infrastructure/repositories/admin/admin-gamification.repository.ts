import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import type { IAdminGamificationRepository } from '../../../domain/repositories/admin/admin-gamification.repository.interface';
import { UserGamificationModel } from '../../database/models/user-gamification.model';
import { UserBadgeModel } from '../../database/models/badge.model';
import { BadgeDefinitionModel } from '../../database/models/badge.model';
import { UserModel } from '../../database/models/user.model';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class AdminGamificationRepository implements IAdminGamificationRepository {
  
  async getOverviewStats() {
    const defaultRes = {
      totalXpEarned: 0,
      avgXpPerUser: 0,
      totalBadgesAwarded: 0,
      activeStreaksCount: 0,
      levelDistribution: [],
      topBadges: [],
      recentBadgeAwards: []
    };

    const [
      xpStats,
      badgesCount,
      activeStreaks,
      levelDist,
      topBadgesRaw,
      recentBadgesRaw
    ] = await Promise.all([
      UserGamificationModel.aggregate([
        { $group: { _id: null, total: { $sum: '$totalXp' }, avg: { $avg: '$totalXp' } } }
      ]),
      UserBadgeModel.countDocuments(),
      UserGamificationModel.countDocuments({ currentStreak: { $gt: 0 } }),
      UserGamificationModel.aggregate([
        { $group: { _id: '$currentLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      UserBadgeModel.aggregate([
        { $group: { _id: '$badgeDefinitionId', count: { $sum: 1 }, badgeKey: { $first: '$badgeKey' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'badgedefinitions', localField: '_id', foreignField: '_id', as: 'badgeDetails' } },
        { $unwind: { path: '$badgeDetails', preserveNullAndEmptyArrays: true } },
        { $project: {
            badgeId: '$_id',
            badgeName: { $ifNull: ['$badgeDetails.name', '$badgeKey'] },
            count: 1
        }}
      ]),
      UserBadgeModel.aggregate([
        { $sort: { earnedAt: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $lookup: { from: 'badgedefinitions', localField: 'badgeDefinitionId', foreignField: '_id', as: 'badgeDetails' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$badgeDetails', preserveNullAndEmptyArrays: true } },
        { $project: {
            userId: '$userId',
            fullName: { $ifNull: ['$user.fullName', 'Unknown User'] },
            badgeName: { $ifNull: ['$badgeDetails.name', '$badgeKey'] },
            earnedAt: 1
        }}
      ])
    ]);

    const totalXpEarned = xpStats.length ? xpStats[0].total : 0;
    const avgXpPerUser = xpStats.length ? Math.round(xpStats[0].avg) : 0;
    
    return {
      totalXpEarned,
      avgXpPerUser,
      totalBadgesAwarded: badgesCount,
      activeStreaksCount: activeStreaks,
      levelDistribution: levelDist.map(d => ({ level: d._id || 0, count: d.count })),
      topBadges: topBadgesRaw.map(b => ({ badgeId: b.badgeId?.toString() || 'unknown', badgeName: b.badgeName, count: b.count })),
      recentBadgeAwards: recentBadgesRaw.map(r => ({
        userId: r.userId?.toString() || '',
        fullName: r.fullName,
        badgeName: r.badgeName,
        earnedAt: r.earnedAt
      }))
    };
  }

  async getUsersProgress({ search, level, title, sortBy, page, limit }: any) {
    const match: any = {};
    if (level) match.currentLevel = Number(level);
    if (title && title !== 'all') match.currentTitle = title;
    
    // sorting
    let sortObj: any = { totalXp: -1 };
    if (sortBy === 'streak') sortObj = { currentStreak: -1 };
    if (sortBy === 'badges') sortObj = { badgeCount: -1 };

    const userMatch: any = { role: UserRole.CLIENT };
    if (search) {
      userMatch.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pipeline: any[] = [
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.role': UserRole.CLIENT } },
    ];
    
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    if (search) {
      pipeline.push({ 
        $match: {
          $or: [
            { 'user.fullName': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push({
      $lookup: { from: 'userbadges', localField: 'userId', foreignField: 'userId', as: 'badges' }
    });

    pipeline.push({
      $addFields: { badgeCount: { $size: '$badges' } }
    });

    // We can filter by badges after projection if needed (not requested)

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalDocs = await UserGamificationModel.aggregate(totalPipeline);
    const total = totalDocs.length ? totalDocs[0].total : 0;

    const dataPipeline = [
      ...pipeline,
      { $sort: sortObj },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: {
          userId: '$userId',
          fullName: '$user.fullName',
          email: '$user.email',
          totalXp: 1,
          currentLevel: 1,
          currentTitle: 1,
          currentStreak: 1,
          badgeCount: 1,
          lastActiveAt: '$updatedAt'
      }}
    ];

    const users = await UserGamificationModel.aggregate(dataPipeline);
    return { users, total };
  }

  async getUserDetail(userId: string) {
    const user = await UserModel.findById(userId).select('fullName email createdAt isPremium').lean();
    if (!user) return null;

    const gamification = await UserGamificationModel.findOne({ userId }).lean();
    const badges = await UserBadgeModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'badgedefinitions', localField: 'badgeDefinitionId', foreignField: '_id', as: 'definition' } },
      { $unwind: { path: '$definition', preserveNullAndEmptyArrays: true } },
      { $project: {
          badgeKey: 1,
          earnedAt: 1,
          name: { $ifNull: ['$definition.name', '$badgeKey'] },
          description: '$definition.description',
          iconUrl: '$definition.iconUrl'
      }},
      { $sort: { earnedAt: -1 } }
    ]);

    return { user, gamification, badges };
  }

  async getLeaderboard({ period, plan, page, limit = 10 }: any) {
    const matchUser: any = { role: UserRole.CLIENT };
    if (plan === 'premium') matchUser.isPremium = true;
    if (plan === 'free') matchUser.isPremium = { $ne: true };

    const pipeline: any[] = [
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.role': UserRole.CLIENT } }
    ];

    if (plan && plan !== 'all') {
      pipeline.push({ $match: { 'user.isPremium': plan === 'premium' } });
    }

    // Usually leaderboard is all-time points. If month/week, we'd need to filter points earned this month,
    // which requires an XP log. Assuming totalXp for all-time. If they want period, maybe we approximate
    // with returning all-time for now, or if period is provided, throw error/do nothing?
    // We will apply basic all-time totalXp sorting.

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalDocs = await UserGamificationModel.aggregate(totalPipeline);
    const total = totalDocs.length ? totalDocs[0].total : 0;

    const dataPipeline = [
      ...pipeline,
      { $sort: { totalXp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: {
          userId: '$userId',
          fullName: '$user.fullName',
          currentLevel: 1,
          currentTitle: 1,
          totalXp: 1,
          currentStreak: 1,
          isPremium: '$user.isPremium'
      }}
    ];

    const rankings = await UserGamificationModel.aggregate(dataPipeline);
    return { rankings, total };
  }

  async getBadgesGrid() {
    const badges = await BadgeDefinitionModel.find().lean();
    
    // Gather statistics for each badge
    const badgeStats = await UserBadgeModel.aggregate([
      { $group: { _id: '$badgeDefinitionId', count: { $sum: 1 } } }
    ]);
    const statsMap = new Map();
    badgeStats.forEach(b => statsMap.set(b._id.toString(), b.count));

    const badgesWithCounts = badges.map((b: any) => ({
      id: b._id.toString(),
      key: b.key,
      name: b.name,
      description: b.description,
      iconUrl: b.iconUrl,
      category: b.category,
      criteriaUrl: b.conditionType + ' ' + b.conditionValue, // Simplified criteria
      usersEarned: statsMap.get(b._id.toString()) || 0,
      isActive: b.isActive
    }));

    const recentBadgesRaw = await UserBadgeModel.aggregate([
      { $sort: { earnedAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'badgedefinitions', localField: 'badgeDefinitionId', foreignField: '_id', as: 'badgeDetails' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$badgeDetails', preserveNullAndEmptyArrays: true } },
      { $project: {
          userId: '$userId',
          fullName: { $ifNull: ['$user.fullName', 'Unknown User'] },
          badgeName: { $ifNull: ['$badgeDetails.name', '$badgeKey'] },
          earnedAt: 1
      }}
    ]);

    return {
      badges: badgesWithCounts,
      recentAwards: recentBadgesRaw
    };
  }

  async toggleBadgeActivation(badgeId: string) {
    const badge = await BadgeDefinitionModel.findById(badgeId);
    if (!badge) throw new Error('Badge not found');
    badge.isActive = !badge.isActive;
    await badge.save();
  }
}
