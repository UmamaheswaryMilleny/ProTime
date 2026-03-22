import { inject, injectable } from 'tsyringe';
import type { IStartChatSessionUsecase } from '../../interface/chat/start-chat-session.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IChatSessionRepository } from '../../../../domain/repositories/chat/chat-session.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { StartChatSessionRequestDTO } from '../../../dto/chat/request/start-chat-session.request.dto';
import type { ChatSessionResponseDTO } from '../../../dto/chat/response/chat-session.response.dto';
import {
    ConversationNotFoundError,
    UnauthorizedMessageError,
    SessionAlreadyActiveError,
} from '../../../../domain/errors/chat.errors';
import { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class StartChatSessionUsecase implements IStartChatSessionUsecase {
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
        dto: StartChatSessionRequestDTO,
    ): Promise<ChatSessionResponseDTO> {

        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        const isParticipant =
            conversation.user1Id === userId ||
            conversation.user2Id === userId;
        if (!isParticipant) throw new UnauthorizedMessageError();

        // Check no session already running
        const activeSession = await this.sessionRepo.findActiveByConversationId(conversationId);
        if (activeSession) throw new SessionAlreadyActiveError();

        const startedAt = new Date();

        const session = await this.sessionRepo.save({
            conversationId,
            startedBy: userId,
            durationMinutes: dto.durationMinutes,
            startedAt,
            pomodorosCompleted: 0,
            controlledBy: userId,
        });

        // Save system message
        await this.messageRepo.save({
            conversationId,
            senderId: null,
            content: `Pomodoro started (${dto.durationMinutes} min)`,
            messageType: MessageType.SYSTEM,
            status: MessageStatus.DELIVERED,
            sessionId: session.id,
        });

        const user = await this.userRepo.findById(userId);
        const response = ChatMapper.sessionToResponse(session, user ?? { id: userId, fullName: 'Unknown' });

        // Emit to both users
        const receiverId = conversation.user1Id === userId
            ? conversation.user2Id
            : conversation.user1Id;

        this.socketService.emitToUser(userId, 'chat:session-started', response);
        this.socketService.emitToUser(receiverId, 'chat:session-started', response);

        return response;
    }
}