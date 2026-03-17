export interface IBlockBuddyUsecase {
  execute(userId: string, targetUserId: string): Promise<void>;
}
