import type { DirectMessageDocument } from '../models/direct-message.model';
import type { DirectMessageEntity } from '../../../domain/entities/chat.entities';

export class DirectMessageInfraMapper {

    static toDomain(doc: DirectMessageDocument): DirectMessageEntity {
        return {
            id: doc._id.toString(),
            conversationId: doc.conversationId.toString(),
            senderId: doc.senderId?.toString() ?? null,
            content: doc.content,
            messageType: doc.messageType,
            status: doc.status,
            readAt: doc.readAt ?? undefined,
            sessionId: doc.sessionId?.toString() ?? undefined,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}