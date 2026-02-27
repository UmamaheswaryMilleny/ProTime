export interface IEvaluateLevelUsecase {
  execute(userId: string): Promise<void>;
}
