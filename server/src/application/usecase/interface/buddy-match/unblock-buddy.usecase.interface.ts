export interface IUnblockBuddyUsecase {
  execute(userId: string, connectionId: string): Promise<void>;
}
