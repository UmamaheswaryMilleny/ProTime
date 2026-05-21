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
import { AdminSubscriptionController } from "../../controllers/admin/admin-subscription.controller";
import { AdminDashboardController } from "../../controllers/admin/admin-dashboard.controller";
import { AdminMeetingController }  from '../../controllers/admin/admin-meeting.controller';
import { AdminGamificationController } from '../../controllers/admin/admin-gamification.controller';
import { AdminSkillController } from '../../controllers/admin/admin-skill.controller';

@injectable()
export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl           = container.resolve(AdminController);
    const reportCtrl     = container.resolve(ReportController);
    const subCtrl        = container.resolve(AdminSubscriptionController);
    const dashboardCtrl  = container.resolve(AdminDashboardController);
    const meetingCtrl    = new AdminMeetingController();
    const gamificationCtrl = container.resolve(AdminGamificationController);
    const skillCtrl      = container.resolve(AdminSkillController);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.ADMIN]));

    // ─── Dashboard ────────────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.DASHBOARD_STATS,
      asyncHandler(dashboardCtrl.getStats.bind(dashboardCtrl)),
    );

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

    // ─── Subscription Management ──────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.SUBSCRIPTION_STATS,
      asyncHandler(subCtrl.getStats.bind(subCtrl)),
    );

    this.router.get(
      ROUTES.ADMIN.SUBSCRIPTIONS,
      asyncHandler(subCtrl.getSubscriptions.bind(subCtrl)),
    );

    this.router.post(
      ROUTES.ADMIN.SUBSCRIPTION_ADD,
      asyncHandler(subCtrl.addSubscription.bind(subCtrl)),
    );

    this.router.patch(
      ROUTES.ADMIN.SUBSCRIPTION_BY_USER_ID,
      asyncHandler(subCtrl.updateSubscription.bind(subCtrl)),
    );

    // ─── Meeting Management ───────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.MEETINGS,
      asyncHandler(meetingCtrl.getMeetings.bind(meetingCtrl)),
    );

    this.router.patch(
      ROUTES.ADMIN.MEETING_FORCE_CLOSE,
      asyncHandler(meetingCtrl.forceClose.bind(meetingCtrl)),
    );

    // ─── Gamification Management ──────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.GAMIFICATION_OVERVIEW,
      asyncHandler(gamificationCtrl.getOverview.bind(gamificationCtrl)),
    );
    this.router.get(
      ROUTES.ADMIN.GAMIFICATION_USERS,
      asyncHandler(gamificationCtrl.getUsers.bind(gamificationCtrl)),
    );
    this.router.get(
      ROUTES.ADMIN.GAMIFICATION_USER_DETAIL,
      asyncHandler(gamificationCtrl.getUserDetail.bind(gamificationCtrl)),
    );
    this.router.get(
      ROUTES.ADMIN.GAMIFICATION_LEADERBOARD,
      asyncHandler(gamificationCtrl.getLeaderboard.bind(gamificationCtrl)),
    );
    this.router.get(
      ROUTES.ADMIN.GAMIFICATION_BADGES,
      asyncHandler(gamificationCtrl.getBadgesGrid.bind(gamificationCtrl)),
    );
    this.router.patch(
      ROUTES.ADMIN.GAMIFICATION_BADGE_TOGGLE,
      asyncHandler(gamificationCtrl.toggleBadge.bind(gamificationCtrl)),
    );

    // ─── Skills Management ───────────────────────────────────────────────
    this.router.get(
      ROUTES.ADMIN.SKILLS,
      asyncHandler(skillCtrl.getSkills.bind(skillCtrl)),
    );
    this.router.post(
      ROUTES.ADMIN.SKILLS,
      asyncHandler(skillCtrl.createSkill.bind(skillCtrl)),
    );
    this.router.put(
      ROUTES.ADMIN.SKILL_BY_ID,
      asyncHandler(skillCtrl.updateSkill.bind(skillCtrl)),
    );
    this.router.patch(
      ROUTES.ADMIN.SKILL_TOGGLE,
      asyncHandler(skillCtrl.toggleSkillStatus.bind(skillCtrl)),
    );
    this.router.delete(
      ROUTES.ADMIN.SKILL_BY_ID,
      asyncHandler(skillCtrl.deleteSkill.bind(skillCtrl)),
    );
  }
}