import { inject, injectable } from "tsyringe";
import type { IXpRepository } from "../../../domain/repositoryInterface/xp/xp-repository.interface";
import type { IAwardXpUsecase } from "../interfaces/award-xp-usecase.interface";

@injectable()
export class AwardXpUsecase implements IAwardXpUsecase {
  constructor(
    @inject("IXpRepository")
    private readonly xpRepository: IXpRepository
  ) {}

  async execute({ userId, xp, source }: {
    userId: string;
    xp: number;
    source: string;
  }): Promise<void> {
    if (xp <= 0) return;

    await this.xpRepository.addTransaction({
      userId,
      xp,
      source,
      createdAt: new Date(),
    });
  }
}
