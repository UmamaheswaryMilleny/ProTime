export interface ISendBuddyRequestUsecase {
  execute(senderId: string, receiverId: string): Promise<void>;
}
