export interface ISendBuddyRequestUsecase {
  execute(requesterId: string, buddyId: string): Promise<void>;
}