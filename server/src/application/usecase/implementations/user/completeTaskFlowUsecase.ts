export interface ICompleteTaskFlowUsecase {
  execute(taskId: string, userId: string): Promise<void>;
}
