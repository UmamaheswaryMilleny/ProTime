export interface ISubscriptionPolicy {
  canCreateStudyRoom(subscriptionActive: boolean): boolean;

  canJoinMoreStudyRooms(
    subscriptionActive: boolean,
    currentJoinedRooms: number
  ): boolean;

  canUnlockBadge(subscriptionActive: boolean): boolean;

  canDownloadReport(subscriptionActive: boolean): boolean;

  canUseProBuddy(
    subscriptionActive: boolean,
    usedTokens: number
  ): boolean;

  canCreateMoreBuddyMatches(
    subscriptionActive: boolean,
    currentMatches: number
  ): boolean;
}
