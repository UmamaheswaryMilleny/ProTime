import type { BadgeCategory } from '../../../../domain/enums/gamification.enums.js';



// Used on profile and badge gallery to show earned badges
export interface UserBadgeResponseDTO {
  id: string;
  badgeKey: string; //eg 'learner','warrior'
  name: string; // denormalized from BadgeDefinition for convenience
  description: string; // denormalized
  iconUrl?: string; // denormalized
  category: BadgeCategory; // denormalized
  xpAwarded: boolean; // false if earned while FREE (no XP bonus given)
  earnedAt: string;
}