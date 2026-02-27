export interface IAcceptBuddyRequestUsecase {
  execute(requestId: string, userId: string): Promise<void>;
}
