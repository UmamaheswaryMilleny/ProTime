import { inject, injectable } from 'tsyringe';
import type { IGetConversationsUsecase } from '../../interface/chat/get-conversations.usecase.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { ConversationResponseDTO } from '../../../dto/chat/response/conversation.response.dto';
import { ChatMapper } from '../../../mapper/chat.mapper';

@injectable()
export class GetConversationsUsecase implements IGetConversationsUsecase {
    constructor(
        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,

        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) { }

    async execute(userId: string): Promise<ConversationResponseDTO[]> {
        const conversations = await this.conversationRepo.findByUserId(userId);
        if (!conversations.length) return [];

        const results = await Promise.all(
            conversations.map(async (conv) => {
                // Other user is whichever of user1/user2 is not me
                const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;

                const [otherUser, unreadCount, lastMessageByUser] = await Promise.all([
                    this.userRepo.findById(otherUserId),
                    this.messageRepo.countUnread(conv.id, userId),
                    conv.lastMessageBy
                        ? this.userRepo.findById(conv.lastMessageBy)
                        : Promise.resolve(null),
                ]);

                if (!otherUser) return null;

                return ChatMapper.conversationToResponse(
                    conv,
                    userId,
                    otherUser,
                    lastMessageByUser?.fullName,
                    unreadCount,
                );
            }),
        );

        return results.filter((r): r is ConversationResponseDTO => r !== null);
    }
}