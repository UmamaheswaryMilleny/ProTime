export interface ICheckUserBlockedUsecase {
  execute(userId: string, role: string): Promise<boolean>;
}