import { inject, injectable } from 'tsyringe';
import type { IAdminGamificationRepository } from '../../../../domain/repositories/admin/admin-gamification.repository.interface';
import type {
  IGetGamificationOverviewUsecase,
  IGetUsersProgressUsecase,
  IGetGamificationUserDetailUsecase,
  IGetGamificationLeaderboardUsecase,
  IGetBadgesGridUsecase,
  IToggleBadgeUsecase
} from '../../interface/admin/admin-gamification.usecases.interface';

@injectable()
export class GetGamificationOverviewUsecase implements IGetGamificationOverviewUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute() { return this.repo.getOverviewStats(); }
}

@injectable()
export class GetUsersProgressUsecase implements IGetUsersProgressUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute(params: any) { return this.repo.getUsersProgress(params); }
}

@injectable()
export class GetGamificationUserDetailUsecase implements IGetGamificationUserDetailUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute(userId: string) { return this.repo.getUserDetail(userId); }
}

@injectable()
export class GetGamificationLeaderboardUsecase implements IGetGamificationLeaderboardUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute(params: any) { return this.repo.getLeaderboard(params); }
}

@injectable()
export class GetBadgesGridUsecase implements IGetBadgesGridUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute() { return this.repo.getBadgesGrid(); }
}

@injectable()
export class ToggleBadgeUsecase implements IToggleBadgeUsecase {
  constructor(@inject('IAdminGamificationRepository') private repo: IAdminGamificationRepository) {}
  async execute(badgeId: string) { return this.repo.toggleBadgeActivation(badgeId); }
}
