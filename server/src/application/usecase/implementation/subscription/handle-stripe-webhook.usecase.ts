import { inject, injectable } from 'tsyringe';
import type Stripe from 'stripe';

import type { IHandleStripeWebhookUsecase } from '../../interface/subscription/handle-stripe-webhook.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { IStripeService } from '../../../service_interface/stripe.service.interface';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../../domain/enums/subscription.enums';

@injectable()
export class HandleStripeWebhookUsecase implements IHandleStripeWebhookUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,

    @inject('UserRepository')
    private readonly userRepository: IUserRepository,

    @inject('IStripeService')
    private readonly stripeService: IStripeService,
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        break;
    }
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  private getPeriodDates(
    stripeSub: Stripe.Subscription,
  ): { currentPeriodStart: Date; currentPeriodEnd: Date } | null {
    const item = stripeSub.items.data[0];

    if (!item) return null;

    return {
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
    };
  }

  // ─── checkout.session.completed ───────────────────────────────────────────

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const stripeCustomerId    = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    // ① Primary path — read userId from metadata (zero race condition risk)
    let userId: string | undefined = session.metadata?.userId;

    // ② Fallback — look up via stripeCustomerId if metadata was missing
    if (!userId) {
      const subscription = await this.subscriptionRepository.findByStripeCustomerId(stripeCustomerId);
      userId = subscription?.userId;
    }

    if (!userId) {
      console.error('[Stripe Webhook] checkout.session.completed: could not resolve userId', { stripeCustomerId });
      return;
    }

    const stripeSub = await this.stripeService.retrieveSubscription(stripeSubscriptionId);
    const periods   = this.getPeriodDates(stripeSub);
    if (!periods) return;

    // ③ Single atomic update — upsert so even first-time users are covered
    await Promise.all([
      this.subscriptionRepository.updateByUserId(userId, {
        plan:                SubscriptionPlan.PREMIUM,
        status:              SubscriptionStatus.ACTIVE,
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodStart:  periods.currentPeriodStart,
        currentPeriodEnd:    periods.currentPeriodEnd,
      }),
      this.userRepository.updateById(userId, { isPremium: true }),
    ]);
  }

  // ─── invoice.payment_succeeded ────────────────────────────────────────────

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const parent = invoice.parent as Stripe.Invoice.Parent | null;
    const stripeSubscriptionId =
      parent?.type === 'subscription_details'
        ? (parent.subscription_details?.subscription as string | undefined)
        : undefined;

    if (!stripeSubscriptionId) return;

    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        stripeSubscriptionId,
      );
    if (!subscription) return;

    const stripeSub =
      await this.stripeService.retrieveSubscription(stripeSubscriptionId);
    const periods = this.getPeriodDates(stripeSub);

    if (!periods) return;

    await this.subscriptionRepository.updateByUserId(subscription.userId, {
      currentPeriodStart: periods.currentPeriodStart,
      currentPeriodEnd: periods.currentPeriodEnd,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  // ─── customer.subscription.deleted ────────────────────────────────────────

  private async handleSubscriptionDeleted(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        stripeSub.id,
      );
    if (!subscription) return;

    await Promise.all([
      this.subscriptionRepository.updateByUserId(subscription.userId, {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.EXPIRED,
      }),
      this.userRepository.updateById(subscription.userId, { isPremium: false }),
    ]);
  }

  // ─── customer.subscription.updated ────────────────────────────────────────

  private async handleSubscriptionUpdated(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    if (!stripeSub.cancel_at_period_end) return;

    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        stripeSub.id,
      );
    if (!subscription) return;

    if (subscription.status === SubscriptionStatus.CANCELLED) return;

    await this.subscriptionRepository.updateByUserId(subscription.userId, {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
    });
  }
}
