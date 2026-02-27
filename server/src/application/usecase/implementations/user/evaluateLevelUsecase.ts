import { inject, injectable } from "tsyringe";
import type { IXpRepository } from "../../../domain/repositoryInterface/xp/xp-repository.interface";
import type { IUserRepository } from "../../../domain/repositoryInterface/user/user-repository-interface";

@injectable()
export class EvaluateLevelUsecase implements IEvaluateLevelUsecase {
  constructor(
    @inject("IXpRepository")
    private readonly xpRepository: IXpRepository,

    @inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const totalXp = await this.xpRepository.getTotalXp(userId);
    const level = this.calculateLevel(totalXp);

    await this.userRepository.updateById(userId, { level });
  }

  private calculateLevel(totalXp: number): number {
    if (totalXp < 100) return 0;
    if (totalXp < 150) return 1;
    if (totalXp < 200) return 2;
    if (totalXp < 250) return 3;
    if (totalXp < 300) return 4;
    return 5; // extend later
  }
}
