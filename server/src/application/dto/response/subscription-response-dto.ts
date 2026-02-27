export interface SubscriptionResponseDTO {
  type: "TRIAL" | "PREMIUM";
  isActive: boolean;
  startedAt: Date;
  expiresAt: Date;
}
