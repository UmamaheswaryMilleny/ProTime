import { inject, injectable } from 'tsyringe';
import type { IEndChatSessionUsecase } from '../../interface/chat/end-chat-session.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IChatSessionRepository } from '../../../../domain/repositories/chat/chat-session.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { ChatSessionResponseDTO } from '../../../dto/chat/response/chat-session.response.dto';
import {
    ConversationNotFoundError,
    UnauthorizedMessageError,
    SessionNotActiveError,
} from '../../../../domain/errors/chat.errors';
import { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class EndChatSessionUsecase implements IEndChatSessionUsecase {
    constructor(
        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,

        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('IChatSessionRepository')
        private readonly sessionRepo: IChatSessionRepository,

        @inject('IUserRepository')
        private readonly userRepo: IUserRepository,

        @inject('ISocketService')
        private readonly socketService: ISocketService,
    ) { }

    async execute(
        userId: string,
        conversationId: string,
    ): Promise<ChatSessionResponseDTO> {

        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        const isParticipant =
            conversation.user1Id === userId ||
            conversation.user2Id === userId;
        if (!isParticipant) throw new UnauthorizedMessageError();

        const activeSession = await this.sessionRepo.findActiveByConversationId(conversationId);
        if (!activeSession) throw new SessionNotActiveError();

        const endedAt = new Date();
        const ended = await this.sessionRepo.endSession(activeSession.id, endedAt);

        // Save system message
        await this.messageRepo.save({
            conversationId,
            senderId: null,
            content: `Pomodoro session ended (${activeSession.pomodorosCompleted} completed)`,
            messageType: MessageType.SYSTEM,
            status: MessageStatus.DELIVERED,
            sessionId: activeSession.id,
        });

        const user = await this.userRepo.findById(activeSession.startedBy);
        const response = ChatMapper.sessionToResponse(
            ended ?? activeSession,
            user ?? { id: activeSession.startedBy, fullName: 'Unknown' },
        );

        // Emit to both users
        const receiverId = conversation.user1Id === userId
            ? conversation.user2Id
            : conversation.user1Id;

        this.socketService.emitToUser(userId, 'chat:session-ended', response);
        this.socketService.emitToUser(receiverId, 'chat:session-ended', response);

        return response;
    }
}