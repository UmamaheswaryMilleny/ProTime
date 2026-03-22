import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { ChatController } from '../../controllers/chat/chat.controller';
import { SendDirectMessageRequestDTO } from '../../../application/dto/chat/request/send-direct-message.request.dto';
import { StartChatSessionRequestDTO } from '../../../application/dto/chat/request/start-chat-session.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';
import { ROUTES } from '../../../shared/constants/constants.routes';

@injectable()
export class ChatRoutes extends BaseRoute {
    constructor() {
        super();
    }

    protected initializeRoutes(): void {
        const ctrl = container.resolve(ChatController);
        const blockedMiddleware = container.resolve(BlockedUserMiddleware);

        // All chat routes require valid JWT + CLIENT role + not blocked
        this.router.use(verifyAuth);
        this.router.use(authorizeRole([UserRole.CLIENT]));
        this.router.use(
            asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
        );

        // GET /api/v1/chat
        this.router.get(
            ROUTES.CHAT.CONVERSATIONS,
            asyncHandler(ctrl.getConversations.bind(ctrl)),
        );

        // GET /api/v1/chat/:conversationId/messages
        this.router.get(
            ROUTES.CHAT.MESSAGES,
            asyncHandler(ctrl.getMessages.bind(ctrl)),
        );

        // POST /api/v1/chat/:conversationId/messages
        this.router.post(
            ROUTES.CHAT.SEND_MESSAGE,
            validationMiddleware(SendDirectMessageRequestDTO),
            asyncHandler(ctrl.sendMessage.bind(ctrl)),
        );

        // PATCH /api/v1/chat/:conversationId/read
        this.router.patch(
            ROUTES.CHAT.MARK_AS_READ,
            asyncHandler(ctrl.markAsRead.bind(ctrl)),
        );

        // POST /api/v1/chat/:conversationId/session/start
        this.router.post(
            ROUTES.CHAT.START_SESSION,
            validationMiddleware(StartChatSessionRequestDTO),
            asyncHandler(ctrl.startSession.bind(ctrl)),
        );

        // POST /api/v1/chat/:conversationId/session/end
        this.router.post(
            ROUTES.CHAT.END_SESSION,
            asyncHandler(ctrl.endSession.bind(ctrl)),
        );
    }
}