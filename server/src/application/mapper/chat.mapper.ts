import type { DirectMessageEntity, ConversationEntity, ChatSessionEntity } from '../../domain/entities/chat.entities';
import type { UserEntity } from '../../domain/entities/user.entity';
import type { DirectMessageResponseDTO } from '../dto/chat/response/direct-message.response.dto';
import type { ConversationResponseDTO } from '../dto/chat/response/conversation.response.dto';
import type { ChatSessionResponseDTO } from '../dto/chat/response/chat-session.response.dto';

export class ChatMapper {

    static messageToResponse(
        entity: DirectMessageEntity,
        user: Pick<UserEntity, 'id' | 'fullName'> | null,
    ): DirectMessageResponseDTO {
        return {
            id: entity.id,
            conversationId: entity.conversationId,
            senderId: entity.senderId?.toString() ?? null,
            fullName: user?.fullName ?? null,
            content: entity.content,
            messageType: entity.messageType,
            status: entity.status,
            readAt: entity.readAt,
            sessionId: entity.sessionId,
            fileUrl: entity.fileUrl,
            fileName: entity.fileName,
            fileSize: entity.fileSize,
            fileType: entity.fileType,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static conversationToResponse(
        entity: ConversationEntity,
        currentUserId: string,
        otherUser: Pick<UserEntity, 'id' | 'fullName'>,
        lastMessageByName: string | undefined,
        lastMessageContent: string | undefined,
        unreadCount: number,
    ): ConversationResponseDTO {
        return {
            id: entity.id,
            buddyConnectionId: entity.buddyConnectionId,
            otherUser: {
                userId: otherUser.id,
                fullName: otherUser.fullName,
            },
            lastMessageAt: entity.lastMessageAt,
            lastMessageBy: entity.lastMessageBy,
            lastMessageByName,
            lastMessageContent,
            unreadCount,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static sessionToResponse(
        entity: ChatSessionEntity,
        startedByUser: Pick<UserEntity, 'id' | 'fullName'>,
    ): ChatSessionResponseDTO {
        return {
            id: entity.id,
            conversationId: entity.conversationId,
            startedBy: entity.startedBy,
            startedByName: startedByUser.fullName,
            durationMinutes: entity.durationMinutes,
            startedAt: entity.startedAt,
            endedAt: entity.endedAt,
            pausedAt: entity.pausedAt,
            pomodorosCompleted: entity.pomodorosCompleted,
            controlledBy: entity.controlledBy,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}