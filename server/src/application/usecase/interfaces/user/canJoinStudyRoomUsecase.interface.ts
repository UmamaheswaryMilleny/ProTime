export interface ICanJoinStudyRoomUsecase {
  execute(userId: string): Promise<boolean>;
}
