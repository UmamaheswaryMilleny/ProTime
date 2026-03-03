import { Schema } from 'mongoose';
import { LevelTitle } from '../../../domain/enums/gamification.enums';

export const UserGamificationSchema = new Schema(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true, 
      index:    true,
    },

    totalXp: {
      type:    Number,
      default: 0,
      min:     0,
    },
    currentLevel: {
      type:    Number,
      default: 0,
      min:     0,
      max:     20,
    },
    currentTitle: {
      type:    String,
      enum:    Object.values(LevelTitle), //Only allow these specific values.
      default: LevelTitle.EARLY_BIRD,
    },


    currentStreak: {
      type:    Number,
      default: 0,
      min:     0,
    },
    longestStreak: {
      type:    Number,
      default: 0,
      min:     0,
    },
    lastStreakDate: {
      type:    Date,
      default: null,
    },
    streakFrozen: {
      type:    Boolean,
      default: false,
    },


    dailyXpEarned: {
      type:    Number,
      default: 0,
      min:     0,
    },
    dailyChatMessageCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    todayPomodoroUsed: {
      type:    Boolean,
      default: false,
    },
    lastDailyResetDate: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);