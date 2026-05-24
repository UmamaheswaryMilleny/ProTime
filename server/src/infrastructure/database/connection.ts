import mongoose from "mongoose";
import { config } from "../../shared/config/index";
import { logger } from "../config/logger.config";
import { BadgeDefinitionModel } from "./models/badge.model";
import { BadgeCategory, BadgeConditionType } from "../../domain/enums/gamification.enums";

async function seedBadges() {
  try {
    const count = await BadgeDefinitionModel.countDocuments();
    if (count === 0) {
      const defaultBadges = [
        {
          key: 'HIGH_ACHIEVER',
          name: 'High Achiever',
          description: 'Complete 1 High-Priority task',
          category: BadgeCategory.TASK,
          conditionType: BadgeConditionType.HIGH_TASK_COUNT,
          conditionValue: 1,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'MEDIUM_MASTER',
          name: 'Medium Master',
          description: 'Complete 1 Medium-Priority task',
          category: BadgeCategory.TASK,
          conditionType: BadgeConditionType.MEDIUM_TASK_COUNT,
          conditionValue: 1,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'STEADY_STARTER',
          name: 'Steady Starter',
          description: 'Complete 1 Low-Priority task',
          category: BadgeCategory.TASK,
          conditionType: BadgeConditionType.LOW_TASK_COUNT,
          conditionValue: 1,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'FOCUS_BUILDER',
          name: 'Focus Builder',
          description: 'Complete a 7-day streak (1 todo + Pomodoro daily)',
          category: BadgeCategory.STREAK,
          conditionType: BadgeConditionType.STREAK_DAYS,
          conditionValue: 7,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'CONSISTENCY_CHAMP',
          name: 'Consistency Champ',
          description: 'Complete a 10-day streak (1 todo + Pomodoro daily)',
          category: BadgeCategory.STREAK,
          conditionType: BadgeConditionType.STREAK_DAYS,
          conditionValue: 10,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'DISCIPLINE_HERO',
          name: 'Discipline Hero',
          description: 'Complete a 16-day streak (1 todo + Pomodoro daily)',
          category: BadgeCategory.STREAK,
          conditionType: BadgeConditionType.STREAK_DAYS,
          conditionValue: 16,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'PERSISTENCE_PRO',
          name: 'Persistence Pro',
          description: 'Complete a 28-day streak (1 todo + Pomodoro daily)',
          category: BadgeCategory.STREAK,
          conditionType: BadgeConditionType.STREAK_DAYS,
          conditionValue: 28,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'REAL_WARRIOR',
          name: 'Real Warrior',
          description: 'Complete a 52-day streak (1 todo + Pomodoro daily)',
          category: BadgeCategory.STREAK,
          conditionType: BadgeConditionType.STREAK_DAYS,
          conditionValue: 52,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'BUDDY_BEGINNER',
          name: 'Buddy Beginner',
          description: 'Match with 2 buddies — min 4⭐ rating, 1 hour session each',
          category: BadgeCategory.BUDDY,
          conditionType: BadgeConditionType.BUDDY_MATCHES,
          conditionValue: 2,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'BUDDY_BUILDER',
          name: 'Buddy Builder',
          description: 'Match with 5 buddies — min 4⭐ rating, 1 hour session each',
          category: BadgeCategory.BUDDY,
          conditionType: BadgeConditionType.BUDDY_MATCHES,
          conditionValue: 5,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'BUDDY_MASTER',
          name: 'Buddy Master',
          description: 'Match with 10 buddies — min 4⭐ rating, 1 hour session each',
          category: BadgeCategory.BUDDY,
          conditionType: BadgeConditionType.BUDDY_MATCHES,
          conditionValue: 10,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'ROOM_EXPLORER',
          name: 'Room Explorer',
          description: 'Attend 2 group study rooms for min 1 hour each',
          category: BadgeCategory.ROOM,
          conditionType: BadgeConditionType.ROOMS_ATTENDED,
          conditionValue: 2,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'ROOM_REGULAR',
          name: 'Room Regular',
          description: 'Attend 5 group study rooms for min 1 hour each',
          category: BadgeCategory.ROOM,
          conditionType: BadgeConditionType.ROOMS_ATTENDED,
          conditionValue: 5,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        },
        {
          key: 'ROOM_LEADER',
          name: 'Room Leader',
          description: 'Attend 10 group study rooms for min 1 hour each',
          category: BadgeCategory.ROOM,
          conditionType: BadgeConditionType.ROOMS_ATTENDED,
          conditionValue: 10,
          xpReward: 50,
          premiumRequired: false,
          isActive: true
        }
      ];

      await BadgeDefinitionModel.insertMany(defaultBadges);
      logger.info("Badge definitions seeded successfully.");
    }
  } catch (error) {
    logger.error("Failed to seed badge definitions", { error });
  }
}

export class MongoConnect {
  private _dburl: string;
  constructor() {
    this._dburl = config.database.URI;
  }
  async connectDB() {
    try {
      await mongoose.connect(this._dburl);
      logger.info("db connected");
      await seedBadges();
      mongoose.connection.on("error", (error) => {
        logger.error("db connection error", { error });
      });
      mongoose.connection.on("disconnected", () => {
        logger.info("db disconnected");
      });
    } catch (error: unknown) {
      logger.error("failed to connect db", { error });
    }
  }
}
