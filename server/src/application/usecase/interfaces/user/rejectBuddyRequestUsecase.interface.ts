export interface IRejectBuddyRequestUsecase {
  execute(requestId: string, userId: string): Promise<void>;
}
