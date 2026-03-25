import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { IChatSessionController }             from '../../interfaces/calendar/chat-session.controller.interface';
import type { IStartSessionUsecase }               from '../../../application/usecase/interface/calendar/start-session.usecase.interface';
import type { IEndSessionUsecase }                 from '../../../application/usecase/interface/calendar/end-session.usecase.interface';
import type { IProposeNextSessionUsecase }         from '../../../application/usecase/interface/calendar/propose-next-session.usecase.interface';
import type { IProposeRecurringSessionUsecase }    from '../../../application/usecase/interface/calendar/propose-recurring-session.usecase.interface';
import type { IRespondToScheduleRequestUsecase }   from '../../../application/usecase/interface/calendar/respond-to-schedule-request.usecase.interface';
import type { ISaveSessionNotesUsecase }           from '../../../application/usecase/interface/calendar/save-session-notes.usecase.interface';
import type { CustomRequest }                      from '../../middlewares/auth.middleware';
import type { ProposeNextSessionRequestDTO }       from '../../../application/dto/calendar/request/propose-next-session.request.dto';
import type { ProposeRecurringSessionRequestDTO }  from '../../../application/dto/calendar/request/propose-recurring-session.request.dto';
import type { RespondToScheduleRequestDTO }        from '../../../application/dto/calendar/request/respond-to-schedule-request.request.dto';
import type { SaveSessionNotesRequestDTO }         from '../../../application/dto/calendar/request/save-session-notes.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class ChatSessionController implements IChatSessionController {
  constructor(
    @inject('IStartSessionUsecase')
    private readonly startSessionUsecase: IStartSessionUsecase,

    @inject('IEndSessionUsecase')
    private readonly endSessionUsecase: IEndSessionUsecase,

    @inject('IProposeNextSessionUsecase')
    private readonly proposeNextSessionUsecase: IProposeNextSessionUsecase,

    @inject('IProposeRecurringSessionUsecase')
    private readonly proposeRecurringSessionUsecase: IProposeRecurringSessionUsecase,

    @inject('IRespondToScheduleRequestUsecase')
    private readonly respondToScheduleRequestUsecase: IRespondToScheduleRequestUsecase,

    @inject('ISaveSessionNotesUsecase')
    private readonly saveSessionNotesUsecase: ISaveSessionNotesUsecase,
  ) {}

  // ─── POST /api/v1/chat/:conversationId/session/start ─────────────────────
  async startSession(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId         = req.user!.id;
      const conversationId = req.params.conversationId as string;
      const result         = await this.startSessionUsecase.execute(userId, conversationId);
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Session started successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/chat/:conversationId/session/end ───────────────────────
  async endSession(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId         = req.user!.id;
      const conversationId = req.params.conversationId as string;
      const result         = await this.endSessionUsecase.execute(userId, conversationId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Session ended successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/chat/:conversationId/session/propose ───────────────────
  async proposeNextSession(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId         = req.user!.id;
      const conversationId = req.params.conversationId as string;
      const dto            = req.body as ProposeNextSessionRequestDTO;
      const result         = await this.proposeNextSessionUsecase.execute(userId, conversationId, dto);
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Next session proposed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/chat/:conversationId/session/propose-recurring ───────────
  async proposeRecurringSession(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId         = req.user!.id;
      const conversationId = req.params.conversationId as string;
      const dto            = req.body as ProposeRecurringSessionRequestDTO;
      const result         = await this.proposeRecurringSessionUsecase.execute(userId, conversationId, dto);
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Recurring session proposed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── PATCH /api/v1/chat/schedule-requests/:requestId/respond ─────────────
  async respondToScheduleRequest(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId    = req.user!.id;
      const requestId = req.params.requestId as string;
      const dto       = req.body as RespondToScheduleRequestDTO;
      const result    = await this.respondToScheduleRequestUsecase.execute(userId, requestId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Schedule request responded successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/chat/sessions/:sessionId/notes ─────────────────────────
  async saveSessionNotes(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId    = req.user!.id;
      const sessionId = req.params.sessionId as string;
      const dto       = req.body as SaveSessionNotesRequestDTO;
      const result    = await this.saveSessionNotesUsecase.execute(userId, sessionId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Session notes saved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
