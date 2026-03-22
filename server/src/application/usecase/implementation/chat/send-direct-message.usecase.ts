import { inject, injectable } from 'tsyringe';
import type { ISendDirectMessageUsecase } from '../../interface/chat/send-direct-message.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ISocketService } from '../../../service_interface/socket-service.interface';
import type { SendDirectMessageRequestDTO } from '../../../dto/chat/request/send-direct-message.request.dto';
import type { DirectMessageResponseDTO } from '../../../dto/chat/response/direct-message.response.dto';
import {
    ConversationNotFoundError,
    UnauthorizedMessageError,
} from '../../../../domain/errors/chat.errors';
import { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class SendDirectMessageUsecase implements ISendDirectMessageUsecase {
    constructor(
        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,

        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('IUserRepository')
        private readonly userRepo: IUserRepository,

        @inject('ISocketService')
        private readonly socketService: ISocketService,
    ) { }

    async execute(
        senderId: string,
        conversationId: string,
        dto: SendDirectMessageRequestDTO,
    ): Promise<DirectMessageResponseDTO> {

        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        const isParticipant =
            conversation.user1Id === senderId ||
            conversation.user2Id === senderId;
        if (!isParticipant) throw new UnauthorizedMessageError();

        const receiverId = conversation.user1Id === senderId
            ? conversation.user2Id
            : conversation.user1Id;

        // Save message as SENT
        const saved = await this.messageRepo.save({
            conversationId,
            senderId,
            content: dto.content.trim(),
            messageType: MessageType.TEXT,
            status: MessageStatus.SENT,
        });

        // Update conversation preview
        await this.conversationRepo.updateLastMessage(
            conversationId,
            saved.createdAt,
            senderId,
        );

        const sender = await this.userRepo.findById(senderId);
        const response = ChatMapper.messageToResponse(saved, sender ?? null);

        // If receiver is online → emit and mark DELIVERED
        if (this.socketService.isUserOnline(receiverId)) {
            this.socketService.emitToUser(receiverId, 'chat:message', response);
            await this.messageRepo.updateStatus(saved.id, MessageStatus.DELIVERED);
        }

        return response;
    }
}