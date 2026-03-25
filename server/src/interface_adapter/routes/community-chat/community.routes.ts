import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';

import { CommunityChatController } from '../../controllers/community-chat/community.controller';

import { SendMessageRequestDTO } from '../../../application/dto/community-chat/request/send-message.request.dto';
import { GetMessagesRequestDTO } from '../../../application/dto/community-chat/request/get-messages.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';
import { ROUTES } from '../../../shared/constants/constants.routes';

@injectable()
export class CommunityChatRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(CommunityChatController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    // All community chat routes require:
    // 1. verifyAuth       → valid JWT + attaches req.user
    // 2. authorizeRole    → must be CLIENT role
    // 3. checkBlockedUser → DB check that user is not blocked
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // ─── Community Chat ───────────────────────────────────────────────

    // GET /api/v1/community-chat
    this.router.get(
      ROUTES.COMMUNITY_CHAT.ROOT,
      validationMiddleware(GetMessagesRequestDTO),
      asyncHandler(ctrl.getMessages.bind(ctrl)),
    );

    // POST /api/v1/community-chat
    this.router.post(
      ROUTES.COMMUNITY_CHAT.ROOT,
      validationMiddleware(SendMessageRequestDTO),
      asyncHandler(ctrl.sendMessage.bind(ctrl)),
    );


    //Calender

    
  }
}
