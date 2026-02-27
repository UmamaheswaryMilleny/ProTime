import { inject, injectable } from "tsyringe";
import type { IBadgeRepository } from "../../../domain/repositoryInterface/badge/badge-repository.interface";
import type { IAwardXpUsecase } from "./award-xp-usecase.interface";

@injectable()
export class EvaluateBadgeUsecase implements IEvaluateBadgeUsecase {
  constructor(
    @inject("IBadgeRepository")
    private readonly badgeRepository: IBadgeRepository,

    @inject("IAwardXpUsecase")
    private readonly awardXpUsecase: IAwardXpUsecase
  ) {}

  async execute(userId: string): Promise<void> {
    const unlockedBadges = await this.badgeRepository.evaluate(userId);

    for (const badge of unlockedBadges) {
      await this.awardXpUsecase.execute({
        userId,
        xp: 50,
        source: "BADGE",
      });
    }
  }
}
