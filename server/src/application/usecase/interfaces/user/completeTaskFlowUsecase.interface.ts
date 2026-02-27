import { inject, injectable } from "tsyringe";

@injectable()
export class CompleteTaskFlowUsecase implements ICompleteTaskFlowUsecase {
  constructor(
    @inject("ICompleteTaskUsecase")
    private readonly completeTask: ICompleteTaskUsecase,

    @inject("IEvaluateBadgeUsecase")
    private readonly evaluateBadge: IEvaluateBadgeUsecase,

    @inject("IEvaluateLevelUsecase")
    private readonly evaluateLevel: IEvaluateLevelUsecase
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    await this.completeTask.execute(taskId, userId);
    await this.evaluateBadge.execute(userId);
    await this.evaluateLevel.execute(userId);
  }
}
