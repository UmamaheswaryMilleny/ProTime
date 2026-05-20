import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { ReportController } from '../../controllers/report/report.controller';
import { ProductivityReportController } from '../../controllers/report/productivity-report.controller';
import { SubmitReportRequestDTO } from '../../../application/dto/report/request/submit-report.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';
import { ROUTES } from '../../../shared/constants/constants.routes';

@injectable()
export class ReportRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl              = container.resolve(ReportController);
    const productivityCtrl  = container.resolve(ProductivityReportController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // POST /api/v1/reports   — submit a complaint report
    this.router.post(
      ROUTES.REPORTS.ROOT,
      validationMiddleware(SubmitReportRequestDTO),
      asyncHandler(ctrl.submitReport.bind(ctrl)),
    );

    // GET /api/v1/reports/productivity?range=7days|30days
    this.router.get(
      ROUTES.REPORTS.PRODUCTIVITY,
      asyncHandler(productivityCtrl.getReport.bind(productivityCtrl)),
    );

    // GET /api/v1/reports/productivity/export?format=csv&range=7days|30days
    this.router.get(
      ROUTES.REPORTS.PRODUCTIVITY_EXPORT,
      asyncHandler(productivityCtrl.exportReport.bind(productivityCtrl)),
    );
  }
}