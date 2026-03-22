import { inject, injectable } from 'tsyringe';
import type { IMarkAsReadUsecase } from '../../interface/chat/mark-as-read.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import {
    ConversationNotFoundError,
    UnauthorizedMessageError,
} from '../../../../domain/errors/chat.errors';

@injectable()
export class MarkAsReadUsecase implements IMarkAsReadUsecase {
    constructor(
        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,

        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('ISocketService')
        private readonly socketService: ISocketService,
    ) { }

    async execute(userId: string, conversationId: string): Promise<void> {
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        const isParticipant =
            conversation.user1Id === userId ||
            conversation.user2Id === userId;
        if (!isParticipant) throw new UnauthorizedMessageError();

        await this.messageRepo.markAllAsRead(conversationId, userId);

        // Notify the sender their messages were read
        const senderId = conversation.user1Id === userId
            ? conversation.user2Id
            : conversation.user1Id;

        if (this.socketService.isUserOnline(senderId)) {
            this.socketService.emitToUser(senderId, 'chat:message-read', {
                conversationId,
                readBy: userId,
            });
        }
    }
}