import { injectable } from 'tsyringe';
import { container } from 'tsyringe';
import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { GamificationController } from '../../controllers/gamification/gamification.controller';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class GamificationRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(GamificationController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)));

    // GET /api/v1/gamification
    // Returns XP, level, title, streak, badges for the dashboard
    // Also lazily resets daily counters if it's a new day
    this.router.get(
      '/',
      asyncHandler(ctrl.getGamification.bind(ctrl)),
    );
  }
}