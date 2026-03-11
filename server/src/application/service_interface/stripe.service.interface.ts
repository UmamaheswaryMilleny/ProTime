import type Stripe from 'stripe';

// Abstracts all Stripe SDK calls — infrastructure implements this.
// Application layer never imports from the Stripe SDK directly.
export interface IStripeService {

  // ─── Customer ─────────────────────────────────────────────────────────────
  // Creates a Stripe customer and returns the customer ID (cus_xxx).
  // Called once on first checkout — stored as stripeCustomerId on subscription.
  createCustomer(email: string, name: string): Promise<string>;

  // ─── Checkout Session ─────────────────────────────────────────────────────
  // Creates a Stripe Checkout Session for the ProTime Premium plan (₹499/month).
  // Returns sessionId and sessionUrl — frontend redirects user to sessionUrl.
  createCheckoutSession(params: {
    stripeCustomerId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; sessionUrl: string }>;

  // ─── Subscription Management ──────────────────────────────────────────────
  // Cancels at period end — user keeps access until currentPeriodEnd.
  // Stripe fires customer.subscription.deleted webhook when access actually ends.
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;

  // ─── Webhook ──────────────────────────────────────────────────────────────
  // Verifies Stripe-Signature header and constructs the event object.
  // rawBody MUST be the raw Buffer — not parsed JSON.
  // Throws InvalidWebhookSignatureError if signature is invalid.
constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event
  // ─── Retrieve Subscription ────────────────────────────────────────────────
  // Fetches a Stripe subscription by ID.
  // Used inside webhook handler to read currentPeriodStart/End after checkout.
  retrieveSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription>;
}