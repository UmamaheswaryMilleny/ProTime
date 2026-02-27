export interface IUserBadgeEntity {
  _id: string;

  userId: string;
  badgeId: string;

  earnedAt: Date;

  isLocked: boolean;
}
