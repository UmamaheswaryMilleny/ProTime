import { inject, injectable } from "tsyringe";
import type { IXpRepository } from "../../../domain/repositoryInterface/xp/xp-repository.interface";

@injectable()
export class AwardXpUsecase {
  constructor(
    @inject("IXpRepository")
    private readonly xpRepository: IXpRepository,
  ) {}

  async execute(userId: string, source: string, xp: number) {
    await this.xpRepository.addTransaction({
      userId,
      source,
      xp,
    });
  }
}
