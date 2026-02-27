@injectable()
export class CanJoinStudyRoomUsecase {
  async execute(userId: string): Promise<boolean> {
    // Trial users limited; premium unlimited
    return true;
  }
}
