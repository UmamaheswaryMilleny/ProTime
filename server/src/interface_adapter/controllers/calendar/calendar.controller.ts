import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { ICalendarController }          from '../../interfaces/calendar/calendar.controller.interface';
import type { IGetCalendarEventsUsecase }     from '../../../application/usecase/interface/calendar/get-calendar-events.usecase.interface';
import type { IGetDayDetailUsecase }          from '../../../application/usecase/interface/calendar/get-day-detail.usecase.interface';
import type { IGetPendingScheduleRequestsUsecase } from '../../../application/usecase/interface/calendar/get-pending-schedule-requests.usecase.interface';
import type { ICreateSoloEventUsecase } from '../../../application/usecase/interface/calendar/create-solo-event.usecase.interface';
import type { CustomRequest }                from '../../middlewares/auth.middleware';
import type { GetCalendarEventsRequestDTO }  from '../../../application/dto/calendar/request/get-calendar-events.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

@injectable()
export class CalendarController implements ICalendarController {
  constructor(
    @inject('IGetCalendarEventsUsecase')
    private readonly getCalendarEventsUsecase: IGetCalendarEventsUsecase,

    @inject('IGetDayDetailUsecase')
    private readonly getDayDetailUsecase: IGetDayDetailUsecase,

    @inject('IGetPendingScheduleRequestsUsecase')
    private readonly getPendingScheduleRequestsUsecase: IGetPendingScheduleRequestsUsecase,

    @inject('ICreateSoloEventUsecase')
    private readonly createSoloEventUsecase: ICreateSoloEventUsecase,
  ) {}

  // ─── GET /api/v1/calendar/events?from=&to= ────────────────────────────────
  async getCalendarEvents(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const dto: GetCalendarEventsRequestDTO = {
        from: req.query.from as string,
        to:   req.query.to   as string,
      };
      const result = await this.getCalendarEventsUsecase.execute(userId, dto);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Calendar events fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/calendar/day/:date ──────────────────────────────────────
  async getDayDetail(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const date   = req.params.date as string; // YYYY-MM-DD
      const result = await this.getDayDetailUsecase.execute(userId, date);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Day detail fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── GET /api/v1/calendar/schedule-requests ───────────────────────────────
  async getPendingScheduleRequests(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getPendingScheduleRequestsUsecase.execute(userId);
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Pending schedule requests fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /api/v1/calendar/events/solo ──────────────────────────────────
  async createSoloEvent(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, date, startTime } = req.body;
      const result = await this.createSoloEventUsecase.execute(userId, title, date, startTime);
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Solo session scheduled successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
