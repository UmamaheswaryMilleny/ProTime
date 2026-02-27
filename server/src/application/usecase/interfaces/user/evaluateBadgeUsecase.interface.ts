export interface IEvaluateBadgeUsecase {
  execute(userId: string): Promise<void>;
}
