import type { IAwardXpUsecase } from "../xp/award-xp-usecase.interface";

@injectable()
export class RateBuddySessionUsecase {
  constructor(
    @inject("IBuddySessionRepository")
    private readonly repo: IBuddySessionRepository,

    @inject("IAwardXpUsecase")
    private readonly awardXpUsecase: IAwardXpUsecase
  ) {}

  async execute({ sessionId, raterId, rating }: {
    sessionId: string;
    raterId: string;
    rating: number;
  }): Promise<void> {
    if (rating >= 4) {
      await this.awardXpUsecase.execute({
        userId: raterId,
        xp: 50,
        source: "BUDDY",
      });
    }

    await this.repo.rateSession(sessionId, raterId, rating);
  }
}
