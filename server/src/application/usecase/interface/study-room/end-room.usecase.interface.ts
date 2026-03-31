export interface IEndRoomUsecase {
  execute(hostId: string, roomId: string): Promise<void>;
}
