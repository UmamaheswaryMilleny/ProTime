import mongoose, { Document, Model } from 'mongoose';
import { UserGamificationSchema } from '../schema/user-gamification.schema';
import { LevelTitle } from '../../../domain/enums/gamification.enums';

export interface UserGamificationDocument extends Document {
  userId:              mongoose.Types.ObjectId;
  totalXp:             number;
  currentLevel:        number;
  currentTitle:        LevelTitle;
  currentStreak:       number;
  longestStreak:       number;
  lastStreakDate:      Date | null;
  streakFrozen:        boolean;
  dailyXpEarned:       number;
  dailyChatMessageCount: number;
  todayPomodoroUsed:   boolean;
  lastDailyResetDate:  Date | null;
  createdAt:           Date;
  updatedAt:           Date;
}

export const UserGamificationModel: Model<UserGamificationDocument> =
  mongoose.models.UserGamification ||
  mongoose.model<UserGamificationDocument>('UserGamification', UserGamificationSchema);