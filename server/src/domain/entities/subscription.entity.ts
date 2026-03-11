import type { SubscriptionPlan, SubscriptionStatus } from '../enums/subscription.enums';

export interface SubscriptionEntity {
  id: string;
  userId: string;
  plan: SubscriptionPlan;     // FREE | PREMIUM
  status: SubscriptionStatus; // ACTIVE | EXPIRED | CANCELLED

  // ─── Stripe fields ────────────────────────────────────────────────────────
  // Null for FREE users who have never paid
  stripeCustomerId?: string;     // cus_xxx — created on first checkout
  stripeSubscriptionId?: string; // sub_xxx — set after checkout.session.completed

  // ─── Period tracking ──────────────────────────────────────────────────────
  // PREMIUM: synced from Stripe invoice on every renewal
  // FREE:    currentPeriodEnd is irrelevant — kept for schema consistency
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;

  // ─── Cancellation ─────────────────────────────────────────────────────────
  // Set when user cancels PREMIUM
  // Access continues until currentPeriodEnd, then webhook sets EXPIRED
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}