import { UserBadgeResponseDTO } from './user-badge.response.dto.js';
import { LevelTitle } from '../../../../domain/enums/gamification.enums.js';
import { BadgeDefinitionResponseDTO } from './badge-definition.response.dto.js';


export interface GamificationResponseDTO {
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: LevelTitle;
  rawLevel: number;

  // isTitleLocked = true when user is FREE and title is above Learner
  isTitleLocked: boolean;

  // XP needed to reach next level 
  xpForCurrentLevel: number; //it is just the level's starting threshold
  xpForNextLevel: number;
  xpProgress: number;

  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;


  dailyXpEarned: number;
  dailyChatMessageCount: number;


  earnedBadges: UserBadgeResponseDTO[];
  totalBadgeCount: number;
  activeBadges: BadgeDefinitionResponseDTO[];
  createdAt: string;
  updatedAt: string;
}




