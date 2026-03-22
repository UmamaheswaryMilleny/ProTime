import type { ChatSessionDocument } from '../models/chat-session.model';
import type { ChatSessionEntity } from '../../../domain/entities/chat.entities';

export class ChatSessionInfraMapper {

    static toDomain(doc: ChatSessionDocument): ChatSessionEntity {
        return {
            id: doc._id.toString(),
            conversationId: doc.conversationId.toString(),
            startedBy: doc.startedBy.toString(),
            durationMinutes: doc.durationMinutes,
            startedAt: doc.startedAt,
            endedAt: doc.endedAt ?? undefined,
            pausedAt: doc.pausedAt ?? undefined,
            pomodorosCompleted: doc.pomodorosCompleted,
            controlledBy: doc.controlledBy?.toString() ?? undefined,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}