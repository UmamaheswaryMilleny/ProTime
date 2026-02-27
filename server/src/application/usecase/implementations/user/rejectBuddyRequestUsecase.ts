@injectable()
export class RejectBuddyRequestUsecase {
  constructor(
    @inject("IBuddyMatchRepository")
    private readonly repo: IBuddyMatchRepository
  ) {}

  async execute(requestId: string, userId: string): Promise<void> {
    await this.repo.rejectRequest(requestId, userId);
  }
}
