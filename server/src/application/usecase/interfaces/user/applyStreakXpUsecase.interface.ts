export interface IApplyStreakXpUsecase {
  execute(userId: string, streakDays: number): Promise<void>;
}
