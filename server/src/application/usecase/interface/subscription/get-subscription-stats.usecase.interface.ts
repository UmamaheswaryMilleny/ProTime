export interface IGetSubscriptionStatsUsecase {
  execute(): Promise<{
    totalUsers:     number;
    premiumCount:   number;
    freeCount:      number;
    cancelledCount: number;
    expiredCount:   number;
    monthlyRevenue: number;
  }>;
}
