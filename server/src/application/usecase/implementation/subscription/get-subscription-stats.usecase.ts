import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionStatsUsecase } from '../../interface/subscription/get-subscription-stats.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';
import { UserRole } from '../../../../domain/enums/user.enums';

@injectable()
export class GetSubscriptionStatsUsecase implements IGetSubscriptionStatsUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<{
    totalUsers:     number;
    premiumCount:   number;
    freeCount:      number;
    cancelledCount: number;
    expiredCount:   number;
    monthlyRevenue: number;
  }> {
    // 1. Fetch counts in parallel for performance
    const [
      totalUsers,
      premiumCount,
      cancelledCount,
      expiredCount,
    ] = await Promise.all([
      this.userRepository.countDocuments({ role: UserRole.CLIENT, isDeleted: { $ne: true } }),
      this.subscriptionRepository.countDocuments({ plan: SubscriptionPlan.PREMIUM, status: SubscriptionStatus.ACTIVE }),
      this.subscriptionRepository.countDocuments({ status: SubscriptionStatus.CANCELLED }),
      this.subscriptionRepository.countDocuments({ status: SubscriptionStatus.EXPIRED }),
    ]);

    // 2. Calculate FREE users (total client users minus those currently on an active premium plan)
    const freeCount = totalUsers - premiumCount;

    // 3. Revenue calculation (premiumActiveCount × ₹499)
    const monthlyRevenue = premiumCount * 499;

    return {
      totalUsers,
      premiumCount,
      freeCount,
      cancelledCount,
      expiredCount,
      monthlyRevenue,
    };
  }
}
