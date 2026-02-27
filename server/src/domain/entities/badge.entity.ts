export type BadgeCategory =
  | "TASK"
  | "STREAK"
  | "BUDDY"
  | "ROOM";

export interface IBadgeEntity {
  _id: string;

  name: string; // "High Achiever", "Focus Builder", etc.

  category: BadgeCategory;

  description: string;

  xpReward: number; // always 50 

  isPremiumOnly: boolean;

  createdAt: Date;
}
