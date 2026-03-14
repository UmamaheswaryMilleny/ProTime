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
import type { IGetSentRequestsUsecase }       from '../../../application/usecase/interface/buddy-match/get-sent-requests.usecase.interface';
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

    @inject('IGetSentRequestsUsecase')
    private readonly getSentRequestsUsecase: IGetSentRequestsUsecase,
  ) {}

  async savePreference(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.saveBuddyPreferenceUsecase.execute(userId, req.body as SaveBuddyPreferenceRequestDTO);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy preference saved successfully', result);
    } catch (error) { next(error); }
  }

  async getPreference(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getBuddyPreferenceUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy preference fetched successfully', result);
    } catch (error) { next(error); }
  }

  async findMatches(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.findBuddyMatchesUsecase.execute(userId, req.query as any);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy matches fetched successfully', result);
    } catch (error) { next(error); }
  }

  async sendRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.sendBuddyRequestUsecase.execute(req.user!.id, req.params.buddyId as string);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy request sent successfully', null);
    } catch (error) { next(error); }
  }

  async respondToRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.respondToBuddyRequestUsecase.execute(req.user!.id, req.params.connectionId as string, req.body as RespondToBuddyRequestDTO);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy request responded successfully', null);
    } catch (error) { next(error); }
  }

  async getBuddyList(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getBuddyListUsecase.execute(req.user!.id);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Buddy list fetched successfully', result);
    } catch (error) { next(error); }
  }

  async getPendingRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getPendingRequestsUsecase.execute(req.user!.id);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Pending requests fetched successfully', result);
    } catch (error) { next(error); }
  }

  async getSentRequests(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getSentRequestsUsecase.execute(req.user!.id);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Sent requests fetched successfully', result);
    } catch (error) { next(error); }
  }
}