import { injectable, container } from 'tsyringe';
import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { CalendarController } from '../../controllers/calendar/calendar.controller';
import { GetCalendarEventsRequestDTO } from '../../../application/dto/calendar/request/get-calendar-events.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class CalendarRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl              = container.resolve(CalendarController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // GET /api/v1/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD
    this.router.get(
      '/events',
      validationMiddleware(GetCalendarEventsRequestDTO),
      asyncHandler(ctrl.getCalendarEvents.bind(ctrl)),
    );

    // GET /api/v1/calendar/day/:date
    this.router.get(
      '/day/:date',
      asyncHandler(ctrl.getDayDetail.bind(ctrl)),
    );

    // GET /api/v1/calendar/schedule-requests
    this.router.get(
      '/schedule-requests',
      asyncHandler(ctrl.getPendingScheduleRequests.bind(ctrl)),
    );

    // POST /api/v1/calendar/events/solo
    this.router.post(
      '/events/solo',
      asyncHandler(ctrl.createSoloEvent.bind(ctrl)),
    );
  }
}
