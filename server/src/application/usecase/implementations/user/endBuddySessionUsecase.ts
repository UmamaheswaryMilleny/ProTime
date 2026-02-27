export interface IEndBuddySessionUsecase {
  execute(sessionId: string, userId: string): Promise<void>;
}
