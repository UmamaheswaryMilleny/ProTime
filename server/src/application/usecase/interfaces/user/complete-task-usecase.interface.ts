export interface ICompleteTaskUsecase {
  execute(taskId: string, userId: string): Promise<void>;
}
