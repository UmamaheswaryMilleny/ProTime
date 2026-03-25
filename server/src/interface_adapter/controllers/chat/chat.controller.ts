import { inject, injectable } from 'tsyringe';
import type { Response, NextFunction } from 'express';

import type { IChatController } from '../../interfaces/chat/chat.controller.interface';
import type { IGetConversationsUsecase } from '../../../application/usecase/interface/chat/get-conversations.usecase.interface';
import type { IGetMessagesUsecase } from '../../../application/usecase/interface/chat/get-messages.usecase.interface';
import type { ISendDirectMessageUsecase } from '../../../application/usecase/interface/chat/send-direct-message.usecase.interface';
import type { IMarkAsReadUsecase } from '../../../application/usecase/interface/chat/mark-as-read.usecase.interface';
import type { IStartChatSessionUsecase } from '../../../application/usecase/interface/chat/start-chat-session.usecase.interface';
import type { IEndChatSessionUsecase } from '../../../application/usecase/interface/chat/end-chat-session.usecase.interface';
import type { IDeleteChatUsecase } from '../../../application/usecase/implementation/chat/delete-chat.usecase';
import type { CustomRequest } from '../../middlewares/auth.middleware';
import type { GetChatMessagesRequestDTO } from '../../../application/dto/chat/request/get-chat-messages.request.dto';
import type { SendDirectMessageRequestDTO } from '../../../application/dto/chat/request/send-direct-message.request.dto';
import type { StartChatSessionRequestDTO } from '../../../application/dto/chat/request/start-chat-session.request.dto';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';


@injectable()
export class ChatController implements IChatController {
    constructor(
        @inject('IGetConversationsUsecase')
        private readonly getConversationsUsecase: IGetConversationsUsecase,

        @inject('IGetMessagesUsecase')
        private readonly getMessagesUsecase: IGetMessagesUsecase,

        @inject('ISendDirectMessageUsecase')
        private readonly sendDirectMessageUsecase: ISendDirectMessageUsecase,

        @inject('IMarkAsReadUsecase')
        private readonly markAsReadUsecase: IMarkAsReadUsecase,

        @inject('IStartChatSessionUsecase')
        private readonly startChatSessionUsecase: IStartChatSessionUsecase,

        @inject('IEndChatSessionUsecase')
        private readonly endChatSessionUsecase: IEndChatSessionUsecase,

        @inject('IDeleteChatUsecase')
        private readonly deleteChatUsecase: IDeleteChatUsecase,
    ) { }

    // ─── GET /api/v1/chat ─────────────────────────────────────────────────────
    async getConversations(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const result = await this.getConversationsUsecase.execute(userId);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Conversations fetched successfully', result);
        } catch (error) {
            next(error);
        }
    }

    // ─── GET /api/v1/chat/:conversationId/messages ────────────────────────────
    async getMessages(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            const dto = req.query as unknown as GetChatMessagesRequestDTO;
            const result = await this.getMessagesUsecase.execute(userId, conversationId, dto);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Messages fetched successfully', result);
        } catch (error) {
            next(error);
        }
    }

    // ─── POST /api/v1/chat/:conversationId/messages ───────────────────────────
    async sendMessage(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            const dto = req.body as SendDirectMessageRequestDTO;
            const result = await this.sendDirectMessageUsecase.execute(userId, conversationId, dto);
            ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Message sent successfully', result);
        } catch (error) {
            next(error);
        }
    }

    // ─── PATCH /api/v1/chat/:conversationId/read ──────────────────────────────
    async markAsRead(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            await this.markAsReadUsecase.execute(userId, conversationId);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Messages marked as read', null);
        } catch (error) {
            next(error);
        }
    }

    // ─── POST /api/v1/chat/:conversationId/session/start ─────────────────────
    async startSession(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            const dto = req.body as StartChatSessionRequestDTO;
            const result = await this.startChatSessionUsecase.execute(userId, conversationId, dto);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Pomodoro session started', result);
        } catch (error) {
            next(error);
        }
    }

    // ─── POST /api/v1/chat/:conversationId/session/end ───────────────────────
    async endSession(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            const result = await this.endChatSessionUsecase.execute(userId, conversationId);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Pomodoro session ended', result);
        } catch (error) {
            next(error);
        }
    }

    // ─── DELETE /api/v1/chat/:conversationId/messages ────────────────────────
    async deleteChat(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user!.id;
            const conversationId = req.params.conversationId as string;
            await this.deleteChatUsecase.execute(userId, conversationId);
            ResponseHelper.success(res, HTTP_STATUS.OK, 'Chat deleted successfully', null);
        } catch (error) {
            next(error);
        }
    }
}
