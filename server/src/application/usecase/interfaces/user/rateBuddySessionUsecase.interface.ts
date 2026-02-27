export interface IRateBuddySessionUsecase {
  execute(params: {
    sessionId: string;
    raterId: string;
    rating: number;
  }): Promise<void>;
}
