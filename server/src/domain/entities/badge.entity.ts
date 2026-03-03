import type { BadgeCategory, BadgeConditionType } from '../enums/gamification.enums';


// badge details
export interface BadgeDefinitionEntity {
    id: string;
    key: string;  // unique, used in code to find this badge fast 'HIGH_ACHIEVER', 'FOCUS_BUILDER'
    name: string;   // display name e.g. 'High Achiever'
    description: string; // 'Complete 10 High-Priority tasks'
    iconUrl?: string;   // badge image 

    category: BadgeCategory;      // TASK | STREAK | BUDDY | ROOM
    conditionType: BadgeConditionType; // what the system checks to award it
    conditionValue: number;             // threshold e.g. 10 for HIGH_TASK_COUNT=10

    xpReward: number;   // XP bonus awarded when badge is earned (default: 50)
    premiumRequired: boolean;  // true = only PREMIUM users can earn this badge
    // false = all users (free + premium) can earn it
    isActive: boolean;  // false = disabled, won't trigger even if condition met admin can deactivate the badge 
    // without deleting, can change somthing about badge by making it false and then make true after changing

    createdAt: Date;
    updatedAt: Date;
}




export interface UserBadgeEntity { //created when user meets a BadgeDefinition condition.
    id: string;
    userId: string;
    badgeDefinitionId: string;   
    badgeKey: string;   //The badgeDefinitionId is still there for when you need full badge details.
    // badgeKey is just for the fast "does this user already have this badge" check.
    earnedAt: Date;
    xpAwarded: boolean;  // true = 50 XP bonus was credited to gamification
    // false = user was FREE, badge earned but no XP bonus
    createdAt: Date;
    updatedAt: Date;
}