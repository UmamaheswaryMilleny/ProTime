import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { IBuddyController } from '../../interfaces/buddy-match/buddy.controller.interface';
import type { ISaveBuddyPreferenceUsecase }   from '../../../application/usecase/interface/buddy-match/save-buddy-preference.usecase.interface';
import type { IGetBuddyPreferenceUsecase }    from '../../../application/usecase/interface/buddy-match/get-buddy-preference.usecase.interface';
import type { IFindBuddyMatchesUsecase }      from '../../../application/usecase/interface/buddy-match/find-buddy-matches.usecase.interface';
import type { ISendBuddyRequestUsecase }      from '../../../application/usecase/interface/buddy-match/send-buddy-request.usecase.interface';
import type { IRespondToBuddyRequestUsecase } from '../../../application/usecase/interface/buddy-match/respond-to-buddy-request.usecase.interface';
import type { IGetBuddyListUsecase }          from '../../../application/usecase/interface/buddy-match/get-buddy-list.usecase.interface';
import type { IGetPendingRequestsUsecase }    from '../../../application/usecase/interface/buddy-match/get-pending-requests.usecase.interface';
import type { CustomRequest } from '../../middlewares/auth.middleware';
import type { SaveBuddyPreferenceRequestDTO } from '../../../application/dto/buddy-match/request/save-buddy-preference.request.dto';
import type { RespondToBuddyRequestDTO }      from '../../../application/dto/buddy-match/request/respond-to-buddy-request.request.dto';
import type { FindBuddyMatchesRequestDTO }    from '../../../application/dto/buddy-match/request/find-buddy-matches.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class BuddyController implements IBuddyController {
  constructor(
    @inject('ISaveBuddyPreferenceUsecase')
    private readonly saveBuddyPreferenceUsecase: ISaveBuddyPreferenceUsecase,

    @inject('IGetBuddyPreferenceUsecase')
    private readonly getBuddyPreferenceUsecase: IGetBuddyPreferenceUsecase,

    @inject('IFindBuddyMatchesUsecase')
    private readonly findBuddyMatchesUsecase: IFindBuddyMatchesUsecase,

    @inject('ISendBuddyRequestUsecase')
    private readonly sendBuddyRequestUsecase: ISendBuddyRequestUsecase,

    @inject('IRespondToBuddyRequestUsecase')
    private readonly respondToBuddyRequestUsecase: IRespondToBuddyRequestUsecase,

    @inject('IGetBuddyListUsecase')
    private readonly getBuddyListUsecase: IGetBuddyListUsecase,

    @inject('IGetPendingRequestsUsecase')
    private readonly getPendingRequestsUsecase: IGetPendingRequestsUsecase,
  ) {}

  // ─── PUT /api/v1/buddy/preference ─────────────────────────────────────────
  async savePreference(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const dto    = req.body as SaveBuddyPreferenceRequestDTO;
      const result = await this.saveBuddyPreferenceUsecase.execute(userId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy preference saved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/buddy/preference ─────────────────────────────────────────
  async getPreference(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getBuddyPreferenceUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy preference fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/buddy/matches ────────────────────────────────────────────
  async findMatches(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const dto    = req.query as unknown as FindBuddyMatchesRequestDTO;
      const result = await this.findBuddyMatchesUsecase.execute(userId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy matches fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/buddy/request/:buddyId ──────────────────────────────────
  async sendRequest(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const buddyId = req.params.buddyId as string;
      await this.sendBuddyRequestUsecase.execute(requesterId, buddyId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy request sent successfully', null);
    } catch (error) {
      next(error);
    }
  }

  // ─── PATCH /api/v1/buddy/request/:connectionId/respond ───────────────────
  async respondToRequest(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const receiverId   = req.user!.id;
   const connectionId = req.params.connectionId as string;
      const dto          = req.body as RespondToBuddyRequestDTO;
      await this.respondToBuddyRequestUsecase.execute(receiverId, connectionId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy request responded successfully', null);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/buddy/list ───────────────────────────────────────────────
  async getBuddyList(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getBuddyListUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy list fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/buddy/requests/pending ───────────────────────────────────
  async getPendingRequests(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getPendingRequestsUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Pending requests fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }
}