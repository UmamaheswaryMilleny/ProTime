import { inject, injectable } from 'tsyringe';

import type { ICreateCheckoutSessionUsecase } from '../../interface/subscription/create-checkout-session.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IStripeService } from '../../../service_interface/stripe.service.interface';
import type { CreateCheckoutSessionRequestDTO } from '../../../dto/subscription/request/create-checkout-session.request.dto';
import type { CheckoutSessionResponseDTO } from '../../../dto/subscription/response/subscription.checkout.session.response.dto';
import {
  AlreadyPremiumError,
} from '../../../../domain/errors/subscription.error';
import { UserNotFoundError } from '../../../../domain/errors/user.error';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';

@injectable()
export class CreateCheckoutSessionUsecase implements ICreateCheckoutSessionUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,

    @inject('IStripeService')
    private readonly stripeService: IStripeService,
  ) { }

  async execute(
    userId: string,
    dto: CreateCheckoutSessionRequestDTO,
  ): Promise<CheckoutSessionResponseDTO> {
    // 1. Fetch subscription and user in parallel — both required
    const [subscription, user] = await Promise.all([
      this.subscriptionRepository.findByUserId(userId),
      this.userRepository.findById(userId),
    ]);

    if (!user) throw new UserNotFoundError();

    // 2. already on active premium, no need to checkout again
    if (
      subscription &&
      subscription.plan === SubscriptionPlan.PREMIUM &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      throw new AlreadyPremiumError();
    }

    // 3. Create Stripe customer if this is the user's first checkout
    //    stripeCustomerId is undefined for FREE users who have never paid
    let stripeCustomerId = subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await this.stripeService.createCustomer(
        user.email,
        user.fullName,
      );
      // Persist immediately so future checkouts reuse the same customer
      await this.subscriptionRepository.updateByUserId(userId, { stripeCustomerId });
    }

    // 4. Create Stripe Checkout Session — frontend redirects user to sessionUrl
    const session = await this.stripeService.createCheckoutSession({
      stripeCustomerId,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      metadata: { userId },  // ← embed userId so webhook can find user
    });

    return {
      sessionId: session.sessionId,
      sessionUrl: session.sessionUrl,
    };
  }
}