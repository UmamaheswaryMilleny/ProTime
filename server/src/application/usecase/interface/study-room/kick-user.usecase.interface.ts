export interface IKickUserUsecase {
  execute(hostId: string, roomId: string, userIdToKick: string): Promise<void>;
}
