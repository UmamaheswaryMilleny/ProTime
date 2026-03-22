import type { ConversationDocument } from '../models/conversation.model';
import type { ConversationEntity } from '../../../domain/entities/chat.entities';

export class ConversationInfraMapper {

    static toDomain(doc: ConversationDocument): ConversationEntity {
        return {
            id: doc._id.toString(),
            buddyConnectionId: doc.buddyConnectionId.toString(),
            user1Id: doc.user1Id.toString(),
            user2Id: doc.user2Id.toString(),
            lastMessageAt: doc.lastMessageAt ?? undefined,
            lastMessageBy: doc.lastMessageBy?.toString() ?? undefined,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}