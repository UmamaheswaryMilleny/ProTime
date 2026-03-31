export interface ILeaveRoomUsecase {
  execute(userId: string, roomId: string): Promise<void>;
}
