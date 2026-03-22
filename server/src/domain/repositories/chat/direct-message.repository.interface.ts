import type { IBaseRepository } from '../base/base.repository.interface';
import type { DirectMessageEntity } from '../../entities/chat.entities';
import type { MessageStatus } from '../../enums/chat.enums';

export interface IDirectMessageRepository
    extends IBaseRepository<DirectMessageEntity> {

    // Cursor-based pagination — consistent with community chat
    // Returns messages older than `before`, sorted createdAt desc
    // Client reverses array for display (oldest top, newest bottom)
    findByConversationId(params: {
        conversationId: string;
        limit: number;
        before?: Date;
    }): Promise<DirectMessageEntity[]>;

    // Count unread messages — replaces unread count fields on ConversationEntity
    // Counts messages WHERE senderId != userId AND status != READ
    countUnread(
        conversationId: string,
        userId: string,
    ): Promise<number>;

    // Update single message status — SENT → DELIVERED → READ
    updateStatus(
        messageId: string,
        status: MessageStatus,
        readAt?: Date,
    ): Promise<DirectMessageEntity | null>;

    // Bulk mark all unread messages as READ when user opens conversation
    markAllAsRead(
        conversationId: string,
        receiverId: string,
    ): Promise<void>;
}