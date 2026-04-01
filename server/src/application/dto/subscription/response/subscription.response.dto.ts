import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../../domain/enums/subscription.enums';

export interface SubscriptionResponseDTO {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Only present for users who have paid at least once
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Null for FREE users who have never had a billing period
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;

  // Set when user cancels — access continues until currentPeriodEnd
  cancelledAt?: string;


  isPremium: boolean; // plan === PREMIUM && status === ACTIVE
  isActive: boolean; // status === ACTIVE regardless of plan
  daysRemaining: number; // days until currentPeriodEnd — 0 if null or expired

  createdAt: string;
  updatedAt: string;

  aiUsageCount: number;
  lastAiUsageReset: string | null;
}
