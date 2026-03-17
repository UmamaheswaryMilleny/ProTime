import type { BadgeCategory } from '../../../../domain/enums/gamification.enums.js';



// Used on profile and badge gallery to show earned badges
export interface UserBadgeResponseDTO {
  id: string;
  badgeKey: string; //eg 'learner','warrior'
  name: string;
  description: string;
  iconUrl?: string;
  category: BadgeCategory;
  xpAwarded: boolean; // false if earned while FREE (no XP bonus given)
  earnedAt: string;
}