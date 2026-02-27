export interface IStartPomodoroUsecase {
  execute(userId: string, durationMinutes: number, taskId?: string): Promise<void>;
}
