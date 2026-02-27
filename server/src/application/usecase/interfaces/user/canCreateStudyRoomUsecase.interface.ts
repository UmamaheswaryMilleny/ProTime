export interface ICanCreateStudyRoomUsecase {
  execute(userId: string): Promise<boolean>;
}
