@injectable()
export class CanUseProBuddyUsecase {
  async execute(userId: string): Promise<boolean> {
    return true; // real check via subscription + token count
  }
}
