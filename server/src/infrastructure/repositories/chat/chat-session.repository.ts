import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { ChatSessionModel, ChatSessionDocument } from '../../database/models/chat-session.model';
import { ChatSessionInfraMapper } from '../../database/mappers/chat-session.infra.mapper';
import type { IChatSessionRepository } from '../../../domain/repositories/chat/chat-session.repository.interface';
import type { ChatSessionEntity } from '../../../domain/entities/chat.entities';

@injectable()
export class ChatSessionRepository
    extends BaseRepository<ChatSessionDocument, ChatSessionEntity>
    implements IChatSessionRepository {
    constructor() {
        super(ChatSessionModel, ChatSessionInfraMapper.toDomain);
    }

    // Active session = endedAt is null
    async findActiveByConversationId(
        conversationId: string,
    ): Promise<ChatSessionEntity | null> {
        const doc = await ChatSessionModel.findOne({
            conversationId,
            endedAt: null,
        }).lean();
        if (!doc) return null;
        return ChatSessionInfraMapper.toDomain(doc as ChatSessionDocument);
    }

    async endSession(
        sessionId: string,
        endedAt: Date,
    ): Promise<ChatSessionEntity | null> {
        const doc = await ChatSessionModel.findByIdAndUpdate(
            sessionId,
            { $set: { endedAt } },
            { new: true },
        ).lean();
        if (!doc) return null;
        return ChatSessionInfraMapper.toDomain(doc as ChatSessionDocument);
    }

    async updatePomodoroState(
        sessionId: string,
        data: Partial<Pick<ChatSessionEntity,
            | 'pausedAt'
            | 'pomodorosCompleted'
            | 'controlledBy'
        >>,
    ): Promise<ChatSessionEntity | null> {
        const update: Record<string, unknown> = {};
        if ('pausedAt' in data) update.pausedAt = data.pausedAt ?? null;
        if (data.pomodorosCompleted !== undefined) update.pomodorosCompleted = data.pomodorosCompleted;
        if ('controlledBy' in data) update.controlledBy = data.controlledBy ?? null;

        const doc = await ChatSessionModel.findByIdAndUpdate(
            sessionId,
            { $set: update },
            { new: true },
        ).lean();

        if (!doc) return null;
        return ChatSessionInfraMapper.toDomain(doc as ChatSessionDocument);
    }
}