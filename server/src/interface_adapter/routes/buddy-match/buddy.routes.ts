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

import { UserRole } from '../../../domain/enums/user.enums';
import { ROUTES } from '../../../shared/constants/constants.routes';

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
      ROUTES.BUDDY.PREFERENCE,
      validationMiddleware(SaveBuddyPreferenceRequestDTO),
      asyncHandler(ctrl.savePreference.bind(ctrl)),
    );

    // GET /api/v1/buddy/preference
    this.router.get(
      ROUTES.BUDDY.PREFERENCE,
      asyncHandler(ctrl.getPreference.bind(ctrl)),
    );

    // GET /api/v1/buddy/matches?page=1&limit=10
// ✅
this.router.get(
  ROUTES.BUDDY.MATCHES,
  asyncHandler(ctrl.findMatches.bind(ctrl)),
);
    // GET /api/v1/buddy/list
    this.router.get(
      ROUTES.BUDDY.LIST,
      asyncHandler(ctrl.getBuddyList.bind(ctrl)),
    );

    // GET /api/v1/buddy/requests/pending
    this.router.get(
      ROUTES.BUDDY.REQUESTS_PENDING,
      asyncHandler(ctrl.getPendingRequests.bind(ctrl)),
    );

    // GET /api/v1/buddy/requests/sent
    this.router.get(
      ROUTES.BUDDY.REQUESTS_SENT,
      asyncHandler(ctrl.getSentRequests.bind(ctrl)),
    );

    // GET  /api/v1/buddy/blocked
    this.router.get(
      '/blocked',
      asyncHandler(ctrl.getBlockedUsers.bind(ctrl)),
    );

    // POST /api/v1/buddy/block/:targetUserId
    this.router.post(
      '/block/:targetUserId',
      asyncHandler(ctrl.blockUser.bind(ctrl)),
    );

    // POST /api/v1/buddy/unblock/:connectionId
    this.router.post(
      '/unblock/:connectionId',
      asyncHandler(ctrl.unblockUser.bind(ctrl)),
    );

    // POST /api/v1/buddy/request/:buddyId
    this.router.post(
      ROUTES.BUDDY.SEND_REQUEST,
      asyncHandler(ctrl.sendRequest.bind(ctrl)),
    );

    // PATCH /api/v1/buddy/request/:connectionId/respond
    this.router.patch(
      ROUTES.BUDDY.RESPOND_REQUEST,
      validationMiddleware(RespondToBuddyRequestDTO),
      asyncHandler(ctrl.respondToRequest.bind(ctrl)),
    );
  }
}