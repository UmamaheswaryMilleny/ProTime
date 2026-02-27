@injectable()
export class CanUnlockBadgeUsecase {
  async execute(userId: string): Promise<boolean> {
    return false; // trial users blocked
  }
}
