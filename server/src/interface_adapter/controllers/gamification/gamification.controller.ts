import type { Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IGamificationController } from '../../interfaces/gamification/gamification.controller.interface';
import type { IGetGamificationUsecase } from '../../../application/usecase/interface/gamification/get-gamification.usecase.interface';
import type { IGetLeaderboardUsecase } from '../../../application/usecase/interface/gamification/get-leaderboard.usecase.interface';
import type { CustomRequest } from '../../middlewares/auth.middleware';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class GamificationController implements IGamificationController {
  constructor(
    @inject('IGetGamificationUsecase')
    private readonly getGamificationUsecase: IGetGamificationUsecase,
    @inject('IGetLeaderboardUsecase')
    private readonly getLeaderboardUsecase: IGetLeaderboardUsecase,
  ) {}

  async getGamification(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const data = await this.getGamificationUsecase.execute(
        req.user.id,
        req.user.isPremium,
      );

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Gamification profile fetched successfully',
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const range = (req.query.range as string) || 'allTime';
      const type = (req.query.type as string) || 'global';
      
      if (!['today', 'weekly', 'monthly', 'allTime'].includes(range)) {
        ResponseHelper.error(res, 'Invalid range', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      if (!['global', 'friends'].includes(type)) {
        ResponseHelper.error(res, 'Invalid type', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const data = await this.getLeaderboardUsecase.execute(
        req.user.id,
        range as any,
        type as any,
        20 // limit to 20
      );

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Leaderboard fetched successfully',
        data,
      );
    } catch (error) {
      next(error);
    }
  }
}