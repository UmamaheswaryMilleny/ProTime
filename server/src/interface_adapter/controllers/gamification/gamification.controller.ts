import type { Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IGamificationController } from '../../interfaces/gamification/gamification.controller.interface';
import type { IGetGamificationUsecase } from '../../../application/usecase/interface/gamification/get-gamification.usecase.interface';
import type { CustomRequest } from '../../middlewares/auth.middleware';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class GamificationController implements IGamificationController {
  constructor(
    @inject('IGetGamificationUsecase')
    private readonly getGamificationUsecase: IGetGamificationUsecase,
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
}