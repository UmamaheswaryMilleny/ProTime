// ← added — cron job marks PENDING requests past expiresAt as EXPIRED
export interface IExpireScheduleRequestsUsecase {
  execute(): Promise<void>;
}
