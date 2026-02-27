@injectable()
export class CompletePomodoroFlowUsecase {
  constructor(
    @inject("ICompletePomodoroUsecase")
    private readonly completePomodoro: ICompletePomodoroUsecase,

    @inject("IEvaluateBadgeUsecase")
    private readonly evaluateBadge: IEvaluateBadgeUsecase,

    @inject("IEvaluateLevelUsecase")
    private readonly evaluateLevel: IEvaluateLevelUsecase
  ) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    await this.completePomodoro.execute(sessionId, userId);
    await this.evaluateBadge.execute(userId);
    await this.evaluateLevel.execute(userId);
  }
}
