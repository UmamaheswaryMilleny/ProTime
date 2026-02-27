export interface ICompletePomodoroFlowUsecase {
  execute(sessionId: string, userId: string): Promise<void>;
}
