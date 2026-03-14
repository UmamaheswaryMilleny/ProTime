import Stripe from 'stripe';
import { injectable } from 'tsyringe';

import type { IStripeService } from '../../application/service_interface/stripe.service.interface';
import { InvalidWebhookSignatureError } from '../../domain/errors/subscription.error';
import { config } from '../../shared/config';

@injectable()
export class StripeService implements IStripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey);
  }

  // ─── Customer ─────────────────────────────────────────────────────────────

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({ email, name });
    return customer.id;
  }

  // ─── Checkout Session ─────────────────────────────────────────────────────

  async createCheckoutSession(params: {
    stripeCustomerId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionId: string; sessionUrl: string }> {
    const session = await this.stripe.checkout.sessions.create({
      customer:   params.stripeCustomerId,
      mode:       'subscription',
      line_items: [
        {
          price:    config.stripe.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url:  params.cancelUrl,
      metadata:    params.metadata,
    });

    return {
      sessionId:  session.id,
      sessionUrl: session.url!,
    };
  }

  // ─── Subscription Management ──────────────────────────────────────────────

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret,
      );
    } catch {
      throw new InvalidWebhookSignatureError();
    }
  }

  // ─── Retrieve Subscription ────────────────────────────────────────────────

  async retrieveSubscription(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['items.data'],
    });
  }
}