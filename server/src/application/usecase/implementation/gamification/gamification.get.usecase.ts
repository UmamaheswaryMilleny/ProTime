import { inject, injectable } from 'tsyringe';
import type { IGetGamificationUsecase } from '../../interface/gamification/get-gamification.usecase.interface';

import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IBadgeDefinitionRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { IUserBadgeRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';

import type { GamificationResponseDTO } from '../../../dto/gamification/response/gamification.response.dto';
import { GamificationMapper } from '../../../mapper/gamification.mapper';
import { GamificationNotFoundError } from '../../../../domain/errors/gamification.error';

@injectable()
export class GetGamificationUsecase implements IGetGamificationUsecase {
  constructor(
    @inject('IGamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,

    @inject('IUserBadgeRepository')
    private readonly userBadgeRepository: IUserBadgeRepository,

    @inject('IBadgeDefinitionRepository')
    private readonly badgeDefinitionRepository: IBadgeDefinitionRepository,
  ) {}

  async execute(
    userId: string,
    isPremium: boolean,
  ): Promise<GamificationResponseDTO> {
    // 1. Fetch gamification profile
    let gamification = await this.gamificationRepository.findByUserId(userId);
    if (!gamification) throw new GamificationNotFoundError();

    // 2. daily reset — check if counters need resetting Runs on first request of each new day 
    const today = new Date();
    //Creates today's date at midnight (00:00:00) 
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const lastReset = gamification.lastDailyResetDate
      ? new Date(
          gamification.lastDailyResetDate.getFullYear(),
          gamification.lastDailyResetDate.getMonth(),
          gamification.lastDailyResetDate.getDate(),
        )
      : null;

    const needsReset = !lastReset || lastReset < todayDate;
    if (needsReset) {
      gamification =
        (await this.gamificationRepository.resetDailyCounters(userId)) ??
        gamification; // fallback if reset fails
    }

    // 3. Fetch earned badges + definitions in parallel
    const [userBadges, allDefinitions] = await Promise.all([
      this.userBadgeRepository.findAllByUserId(userId),
      this.badgeDefinitionRepository.findAllActive(),
    ]);

    // 4. Map earned badges — join with definition for name/description/icon
    const definitionMap = new Map(allDefinitions.map((d) => [d.key, d]));
    const badgeDTOs = userBadges
      .map((ub) => {
        const def = definitionMap.get(ub.badgeKey);
        if (!def) return null; 
        return GamificationMapper.toBadgeResponse(ub, def);
      })
      .filter(Boolean) as ReturnType< // removes any null entries
      typeof GamificationMapper.toBadgeResponse
    >[];

    // 5. Map to response
    return GamificationMapper.toResponse(gamification, badgeDTOs, isPremium);
  }
}
