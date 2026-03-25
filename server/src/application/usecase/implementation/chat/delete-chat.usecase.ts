import { inject, injectable } from 'tsyringe';
import type { IDirectMessageRepository } from '../../../../domain/repositories/chat/direct-message.repository.interface';
import type { IConversationRepository } from '../../../../domain/repositories/chat/conversation.repository.interface';
import { ConversationNotFoundError } from '../../../../domain/errors/chat.errors';

export interface IDeleteChatUsecase {
    execute(userId: string, conversationId: string): Promise<void>;
}

@injectable()
export class DeleteChatUsecase implements IDeleteChatUsecase {
    constructor(
        @inject('IDirectMessageRepository')
        private readonly messageRepo: IDirectMessageRepository,

        @inject('IConversationRepository')
        private readonly conversationRepo: IConversationRepository,
    ) {}

    async execute(userId: string, conversationId: string): Promise<void> {
        // Verify the conversation exists and the user is a participant
        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) throw new ConversationNotFoundError();

        // Verify user is part of this conversation
        if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            throw new ConversationNotFoundError();
        }

        // Delete all messages in this conversation
        await this.messageRepo.deleteByConversationId(conversationId);

        // Clear conversation metadata
        await this.conversationRepo.updateLastMessage(conversationId, null as any, null as any);
    }
}
