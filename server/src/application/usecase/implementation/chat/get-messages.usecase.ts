import { inject, injectable } from 'tsyringe';
import type { IGetMessagesUsecase } from '../../interface/chat/get-messages.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { GetChatMessagesRequestDTO } from '../../../dto/chat/request/get-chat-messages.request.dto';
import type { GetChatMessagesResponseDTO } from '../../../dto/chat/response/get-chat-messages.response.dto';
import {
    ConversationNotFoundError,
    UnauthorizedMessageError,
} from '../../../../domain/errors/chat.errors';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class GetMessagesUsecase implements IGetMessagesUsecase {
    constructor(
        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,

        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) { }

    async execute(
        userId: string,
        conversationId: string,
        dto: GetChatMessagesRequestDTO,
    ): Promise<GetChatMessagesResponseDTO> {

        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        const isParticipant =
            conversation.user1Id === userId ||
            conversation.user2Id === userId;
        if (!isParticipant) throw new UnauthorizedMessageError();

        const before = dto.before ? new Date(dto.before) : undefined;

        // Fetch limit+1 to detect hasMore
        const raw = await this.messageRepo.findByConversationId({
            conversationId,
            limit: dto.limit + 1,
            before,
        });

        const hasMore = raw.length > dto.limit;
        const messages = hasMore ? raw.slice(0, dto.limit) : raw;

        // Parallel fetch all senders — null for SYSTEM messages
        const users = await Promise.all(
            messages.map(m =>
                m.senderId ? this.userRepo.findById(m.senderId) : Promise.resolve(null),
            ),
        );

        const mapped = messages.map((msg, i) =>
            ChatMapper.messageToResponse(msg, users[i] ?? null),
        );

        return { messages: mapped, hasMore };
    }
}