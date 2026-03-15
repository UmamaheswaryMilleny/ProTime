import type { SubscriptionPlan, SubscriptionStatus } from '../enums/subscription.enums';

export interface SubscriptionEntity {
  id: string;
  userId: string;
  plan: SubscriptionPlan;    
  status: SubscriptionStatus; 
  stripeCustomerId?: string;     
  stripeSubscriptionId?: string; 
  currentPeriodStart: Date | null; //Null for FREE users who have never paid
  currentPeriodEnd: Date | null; 
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}