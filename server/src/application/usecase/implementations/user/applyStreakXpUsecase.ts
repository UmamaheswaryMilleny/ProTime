import { inject, injectable } from "tsyringe";
import type { IAwardXpUsecase } from "../interfaces/awardXpUsecase";

const STREAK_XP_MAP: Record<number, number> = {
  3: 5,
  5: 10,
  7: 15,
  10: 25,
  15: 40,
  20: 60,
  30: 100,
  50: 200,
  75: 300,
  100: 500,
};

@injectable()
export class ApplyStreakXpUsecase implements IApplyStreakXpUsecase {
  constructor(
    @inject("IAwardXpUsecase")
    private readonly awardXpUsecase: IAwardXpUsecase
  ) {}

  async execute(userId: string, streakDays: number): Promise<void> {
    const xp = STREAK_XP_MAP[streakDays];
    if (!xp) return;

    await this.awardXpUsecase.execute({
      userId,
      xp,
      source: "STREAK",
    });
  }
}
