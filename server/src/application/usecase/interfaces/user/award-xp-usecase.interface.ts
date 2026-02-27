export interface IAwardXpUsecase {
  execute(userId: string, source: string, xp: number): Promise<void>;
}
