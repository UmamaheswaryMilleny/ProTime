export interface IBlockUnblockUserUsecase {
  execute(userId: string, isBlocked: boolean): Promise<void>;
}