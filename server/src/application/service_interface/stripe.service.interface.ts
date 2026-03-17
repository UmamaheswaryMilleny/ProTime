import type Stripe from 'stripe';


export interface IStripeService {

  //returns stripeCustomerId on subscription.
  createCustomer(email: string, name: string): Promise<string>;


  createCheckoutSession(params: {
    stripeCustomerId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionId: string; sessionUrl: string }>;

  // Cancels at period end — user keeps access until currentPeriodEnd.
  // Stripe fires customer.subscription.deleted webhook when access actually ends.
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;


  // Verifies Stripe-Signature header and constructs the event object.
  // rawBody MUST be the raw Buffer — not parsed JSON.
  // Throws InvalidWebhookSignatureError if signature is invalid.
  // onstructWebhookEvent is synchronous All it does is a mathematical signature verification
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event
  // ─── Retrieve Subscription ────────────────────────────────────────────────
  // Fetches a Stripe subscription by ID.
  // Used inside webhook handler to read currentPeriodStart/End after checkout.
  retrieveSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription>;
}