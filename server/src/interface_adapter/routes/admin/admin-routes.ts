import { injectable } from "tsyringe";
import { container } from "tsyringe";

import { BaseRoute } from "../base-route";
import { asyncHandler } from "../../../shared/asyncHandler";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { verifyAuth, authorizeRole } from "../../middlewares/auth.middleware";
import { ROUTES } from "../../../shared/constants/constants.routes";
import { AdminController } from "../../controllers/admin/admin-controller";
import { GetUsersRequestDTO } from "../../../application/dto/user/request/get-user.request.dto";
import { UserRole } from "../../../domain/enums/user.enums";
import { ReportController }        from '../../controllers/report/report.controller';
import { ResolveReportRequestDTO } from '../../../application/dto/report/request/resolve-report.request.dto';
import { GetReportsRequestDTO }    from '../../../application/dto/report/request/get-reports.request.dto';


@injectable()
export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl       = container.resolve(AdminController);
    const reportCtrl = container.resolve(ReportController);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.ADMIN]));

    // ─── User Management ──────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.USERS,
      validationMiddleware(GetUsersRequestDTO),
      asyncHandler(ctrl.getUsers.bind(ctrl)),
    );

    this.router.patch(
      ROUTES.ADMIN.BLOCK_USER,
      asyncHandler(ctrl.blockUser.bind(ctrl)),
    );

    this.router.patch(
      ROUTES.ADMIN.UNBLOCK_USER,
      asyncHandler(ctrl.unblockUser.bind(ctrl)),
    );

    // ─── Report Management ────────────────────────────────────────────

    // GET /api/v1/admin/reports?status=PENDING&page=1&limit=20
this.router.get(
  ROUTES.ADMIN.REPORTS,
  validationMiddleware(GetReportsRequestDTO),
  asyncHandler(reportCtrl.getReports.bind(reportCtrl)),
);

this.router.get(
  ROUTES.ADMIN.REPORT_BY_ID,
  asyncHandler(reportCtrl.getReportById.bind(reportCtrl)),
);

this.router.patch(
  ROUTES.ADMIN.RESOLVE_REPORT,
  validationMiddleware(ResolveReportRequestDTO),
  asyncHandler(reportCtrl.resolveReport.bind(reportCtrl)),
);
  }
}