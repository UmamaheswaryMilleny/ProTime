export type SubscriptionType = "TRIAL" | "PREMIUM";

export interface ISubscriptionEntity {
  _id: string;

  userId: string;

  type: SubscriptionType;

  startedAt: Date;
  expiresAt: Date;

  isActive: boolean;
}
