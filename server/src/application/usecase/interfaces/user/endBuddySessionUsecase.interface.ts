@injectable()
export class EndBuddySessionUsecase {
  constructor(
    @inject("IBuddySessionRepository")
    private readonly repo: IBuddySessionRepository
  ) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    await this.repo.endSession(sessionId, userId);
  }
}
