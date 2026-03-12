import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionUsecase } from '../../interface/subscription/get-subscription.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';
import { SubscriptionMapper } from '../../../mapper/subscription.mapper';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';

@injectable()
export class GetSubscriptionUsecase implements IGetSubscriptionUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<SubscriptionResponseDTO> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    
    if (!subscription) {
      return {
        id: 'free',
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        isPremium: false,
        isActive: true,
        daysRemaining: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return SubscriptionMapper.toResponse(subscription);
  }
}
