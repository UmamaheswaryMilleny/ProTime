import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import type { 
  IGetGamificationOverviewUsecase, 
  IGetUsersProgressUsecase, 
  IGetGamificationUserDetailUsecase, 
  IGetGamificationLeaderboardUsecase, 
  IGetBadgesGridUsecase, 
  IToggleBadgeUsecase 
} from '../../../application/usecase/interface/admin/admin-gamification.usecases.interface';

@injectable()
export class AdminGamificationController {
  constructor(
    @inject('IGetGamificationOverviewUsecase') private getOverviewUsecase: IGetGamificationOverviewUsecase,
    @inject('IGetUsersProgressUsecase') private getUsersProgressUsecase: IGetUsersProgressUsecase,
    @inject('IGetGamificationUserDetailUsecase') private getUserDetailUsecase: IGetGamificationUserDetailUsecase,
    @inject('IGetGamificationLeaderboardUsecase') private getLeaderboardUsecase: IGetGamificationLeaderboardUsecase,
    @inject('IGetBadgesGridUsecase') private getBadgesGridUsecase: IGetBadgesGridUsecase,
    @inject('IToggleBadgeUsecase') private toggleBadgeUsecase: IToggleBadgeUsecase
  ) {}

  async getOverview(req: Request, res: Response) {
    const data = await this.getOverviewUsecase.execute();
    res.status(200).json({ success: true, data });
  }

  async getUsers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const level = req.query.level as string;
    const title = req.query.title as string;
    const sortBy = req.query.sortBy as string;

    const data = await this.getUsersProgressUsecase.execute({
      search, level, title, sortBy, page, limit
    });
    
    res.status(200).json({ success: true, data: { ...data, page, limit } });
  }

  async getUserDetail(req: Request, res: Response) {
    const userId = req.params.userId as string;
    const data = await this.getUserDetailUsecase.execute(userId);
    res.status(200).json({ success: true, data });
  }

  async getLeaderboard(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const period = req.query.period as string;
    const plan = req.query.plan as string;

    const data = await this.getLeaderboardUsecase.execute({
      period, plan, page, limit
    });

    res.status(200).json({ success: true, data: { ...data, page, limit } });
  }

  async getBadgesGrid(req: Request, res: Response) {
    const data = await this.getBadgesGridUsecase.execute();
    res.status(200).json({ success: true, data });
  }

  async toggleBadge(req: Request, res: Response) {
    const badgeId = req.params.badgeId as string;
    await this.toggleBadgeUsecase.execute(badgeId);
    res.status(200).json({ success: true, message: 'Badge status toggled' });
  }
}
