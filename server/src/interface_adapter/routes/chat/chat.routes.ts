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
import { ChatSessionController } from '../../controllers/calendar/chat-session.controller';
import { ProposeNextSessionRequestDTO } from '../../../application/dto/calendar/request/propose-next-session.request.dto';
import { ProposeRecurringSessionRequestDTO } from '../../../application/dto/calendar/request/propose-recurring-session.request.dto'
import { RespondToScheduleRequestDTO } from '../../../application/dto/calendar/request/respond-to-schedule-request.request.dto';
import { SaveSessionNotesRequestDTO } from '../../../application/dto/calendar/request/save-session-notes.request.dto';
import { chatUploadMiddleware } from '../../middlewares/upload.middleware';

@injectable()
export class ChatRoutes extends BaseRoute {
    constructor() {
        super();
    }

    protected initializeRoutes(): void {
        const ctrl = container.resolve(ChatController);
        const blockedMiddleware = container.resolve(BlockedUserMiddleware);
const sessionCtrl        = container.resolve(ChatSessionController);
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
        
        // POST /api/v1/chat/upload
        this.router.post(
            ROUTES.CHAT.UPLOAD,
            chatUploadMiddleware.single('file'),
            asyncHandler(ctrl.uploadAttachment.bind(ctrl)),
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

        // DELETE /api/v1/chat/:conversationId/messages
        this.router.delete(
            ROUTES.CHAT.DELETE_CHAT,
            asyncHandler(ctrl.deleteChat.bind(ctrl)),
        );
        // ─── BuddySession (calendar-tracked study sessions) ───────────────────────

    // POST /api/v1/chat/:conversationId/buddy-session/start
    this.router.post(
      '/:conversationId/buddy-session/start',
      asyncHandler(sessionCtrl.startSession.bind(sessionCtrl)),
    );

    // POST /api/v1/chat/:conversationId/buddy-session/end
    this.router.post(
      '/:conversationId/buddy-session/end',
      asyncHandler(sessionCtrl.endSession.bind(sessionCtrl)),
    );

    // POST /api/v1/chat/:conversationId/buddy-session/propose
    this.router.post(
      '/:conversationId/buddy-session/propose',
      validationMiddleware(ProposeNextSessionRequestDTO),
      asyncHandler(sessionCtrl.proposeNextSession.bind(sessionCtrl)),
    );

    // POST /api/v1/chat/:conversationId/buddy-session/propose-recurring
    this.router.post(
      '/:conversationId/buddy-session/propose-recurring',
      validationMiddleware(ProposeRecurringSessionRequestDTO),
      asyncHandler(sessionCtrl.proposeRecurringSession.bind(sessionCtrl)),
    );

    // ─── Schedule requests ────────────────────────────────────────────────────

    // PATCH /api/v1/chat/schedule-requests/:requestId/respond
    this.router.patch(
      '/schedule-requests/:requestId/respond',
      validationMiddleware(RespondToScheduleRequestDTO),
      asyncHandler(sessionCtrl.respondToScheduleRequest.bind(sessionCtrl)),
    );

    // ─── Session notes ────────────────────────────────────────────────────────

    // POST /api/v1/chat/sessions/:sessionId/notes
    this.router.post(
      '/sessions/:sessionId/notes',
      validationMiddleware(SaveSessionNotesRequestDTO),
      asyncHandler(sessionCtrl.saveSessionNotes.bind(sessionCtrl)),
    );
    }
}