export interface ICanUseProBuddyUsecase {
  execute(userId: string): Promise<boolean>;
}
