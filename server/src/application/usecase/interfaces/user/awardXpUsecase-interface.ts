export interface IAwardXpUsecase {
  execute(params: {
    userId: string;
    xp: number;
    source: string; // TASK | POMODORO | STREAK | BADGE | BUDDY
  }): Promise<void>;
}
