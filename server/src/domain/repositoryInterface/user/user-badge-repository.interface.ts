import type { IUserBadgeEntity } from "../../entities/user-badge.entity.js";

export interface IUserBadgeRepository {
  hasBadge(
    userId: string,
    badgeId: string
  ): Promise<boolean>;

  grantBadge(
    userBadge: IUserBadgeEntity
  ): Promise<void>;

  findLockedBadges(userId: string): Promise<IUserBadgeEntity[]>;
}
