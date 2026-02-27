export interface ICompletePomodoroUsecase {
  execute(sessionId: string, userId: string): Promise<void>;
}
