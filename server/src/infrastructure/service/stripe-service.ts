import Stripe from 'stripe';
import { injectable } from 'tsyringe';

import type { IStripeService } from '../../application/service_interface/stripe.service.interface';
import { InvalidWebhookSignatureError } from '../../domain/errors/subscription.error';

@injectable()
export class StripeService implements IStripeService {
  private readonly stripe: Stripe;

  constructor() {
    // STRIPE_SECRET_KEY must be set in environment — server fails fast if missing
    const secretKey = process.env['STRIPE_SECRET_KEY'];
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not defined');

    this.stripe = new Stripe(secretKey);
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
  }): Promise<{ sessionId: string; sessionUrl: string }> {
    const priceId = process.env['STRIPE_PRICE_ID'];
    if (!priceId) throw new Error('STRIPE_PRICE_ID is not defined');

    const session = await this.stripe.checkout.sessions.create({
      customer:   params.stripeCustomerId,
      mode:       'subscription',
      currency:   'inr',
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url:  params.cancelUrl,
    });

    return {
      sessionId:  session.id,
      // url is always present for hosted checkout sessions
      sessionUrl: session.url!,
    };
  }

  // ─── Subscription Management ──────────────────────────────────────────────
  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    // cancel_at_period_end: true — user keeps access until currentPeriodEnd
    // Stripe fires customer.subscription.deleted webhook when period ends
    await this.stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────
 constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');

  try {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
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