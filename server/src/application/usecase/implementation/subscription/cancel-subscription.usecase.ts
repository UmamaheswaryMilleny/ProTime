import { inject, injectable } from 'tsyringe';

import type { ICancelSubscriptionUsecase } from '../../interface/subscription/cancel-subscription.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IStripeService } from '../../../service_interface/stripe.service.interface';
import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';
import { SubscriptionMapper } from '../../../mapper/subscription.mapper';

import {
  SubscriptionNotFoundError,
  SubscriptionNotCancellableError,
} from '../../../../domain/errors/subscription.error';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../../domain/enums/subscription.enums';

@injectable()
export class CancelSubscriptionUsecase implements ICancelSubscriptionUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('IStripeService')
    private readonly stripeService: IStripeService,
  ) {}

  async execute(userId: string): Promise<SubscriptionResponseDTO> {
    // 1. Fetch current subscription
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) throw new SubscriptionNotFoundError();

    // 2. Guard — only ACTIVE PREMIUM with a valid Stripe subscription can be cancelled
    if (
      subscription.plan !== SubscriptionPlan.PREMIUM ||
      subscription.status !== SubscriptionStatus.ACTIVE ||
      !subscription.stripeSubscriptionId
    ) {
      throw new SubscriptionNotCancellableError();
    }

    // 3. Cancel at period end in Stripe — user keeps access until currentPeriodEnd
    //    Stripe fires customer.subscription.deleted when the period actually ends
    await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    // 4. Reflect cancellation in DB immediately — plan stays PREMIUM until webhook fires
    const updated = await this.subscriptionRepository.updateByUserId(userId, {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
    });
    if (!updated) throw new SubscriptionNotFoundError();

    return SubscriptionMapper.toResponse(updated);
  }
}
