export interface ICanUnlockBadgeUsecase {
  execute(userId: string): Promise<boolean>;
}
