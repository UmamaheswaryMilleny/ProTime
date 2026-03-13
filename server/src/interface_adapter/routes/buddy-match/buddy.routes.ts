import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { BuddyController } from '../../controllers/buddy-match/buddy.controller';
import { SaveBuddyPreferenceRequestDTO } from '../../../application/dto/buddy-match/request/save-buddy-preference.request.dto';
import { RespondToBuddyRequestDTO }      from '../../../application/dto/buddy-match/request/respond-to-buddy-request.request.dto';
import { FindBuddyMatchesRequestDTO }    from '../../../application/dto/buddy-match/request/find-buddy-matches.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class BuddyRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl              = container.resolve(BuddyController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    // All buddy routes require valid JWT + CLIENT role + not blocked
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // PUT /api/v1/buddy/preference
    this.router.put(
      '/preference',
      validationMiddleware(SaveBuddyPreferenceRequestDTO),
      asyncHandler(ctrl.savePreference.bind(ctrl)),
    );

    // GET /api/v1/buddy/preference
    this.router.get(
      '/preference',
      asyncHandler(ctrl.getPreference.bind(ctrl)),
    );

    // GET /api/v1/buddy/matches?page=1&limit=10
// ✅
this.router.get(
  '/matches',
  asyncHandler(ctrl.findMatches.bind(ctrl)),
);
    // GET /api/v1/buddy/list
    this.router.get(
      '/list',
      asyncHandler(ctrl.getBuddyList.bind(ctrl)),
    );

    // GET /api/v1/buddy/requests/pending
    // — must be registered BEFORE /:buddyId to avoid route collision
    this.router.get(
      '/requests/pending',
      asyncHandler(ctrl.getPendingRequests.bind(ctrl)),
    );

    // POST /api/v1/buddy/request/:buddyId
    this.router.post(
      '/request/:buddyId',
      asyncHandler(ctrl.sendRequest.bind(ctrl)),
    );

    // PATCH /api/v1/buddy/request/:connectionId/respond
    this.router.patch(
      '/request/:connectionId/respond',
      validationMiddleware(RespondToBuddyRequestDTO),
      asyncHandler(ctrl.respondToRequest.bind(ctrl)),
    );
  }
}