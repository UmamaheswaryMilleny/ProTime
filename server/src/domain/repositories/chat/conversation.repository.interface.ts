import type { IBaseRepository } from '../base/base.repository.interface';
import type { ConversationEntity } from '../../entities/chat.entities';

export interface IConversationRepository
    extends IBaseRepository<ConversationEntity> {

    // Find existing conversation created for this buddy connection
    // Used in RespondToBuddyRequestUsecase to prevent duplicate rooms
    findByBuddyConnectionId(
        buddyConnectionId: string,
    ): Promise<ConversationEntity | null>;

    // All conversations for a user — sorted by lastMessageAt desc
    // Used for chat sidebar list
    findByUserId(userId: string): Promise<ConversationEntity[]>;

    // Update preview fields after each new message is sent
    updateLastMessage(
        conversationId: string,
        lastMessageAt: Date,
        lastMessageBy: string | null,
    ): Promise<ConversationEntity | null>;

    // findAIConversation(userId: string): Promise<ConversationEntity | null>;
}