import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { ConversationModel, ConversationDocument } from '../../database/models/conversation.model';
import { ConversationInfraMapper } from '../../database/mappers/conversation.infra.mapper';
import type { IConversationRepository } from '../../../domain/repositories/chat/conversation.repository.interface';
import type { ConversationEntity } from '../../../domain/entities/chat.entities';

@injectable()
export class ConversationRepository
    extends BaseRepository<ConversationDocument, ConversationEntity>
    implements IConversationRepository {
    constructor() {
        super(ConversationModel, ConversationInfraMapper.toDomain);
    }

    async findByBuddyConnectionId(
        buddyConnectionId: string,
    ): Promise<ConversationEntity | null> {
        const doc = await ConversationModel.findOne({ buddyConnectionId }).lean();
        if (!doc) return null;
        return ConversationInfraMapper.toDomain(doc as ConversationDocument);
    }

    // All conversations for this user — sorted by lastMessageAt desc
    async findByUserId(userId: string): Promise<ConversationEntity[]> {
        const docs = await ConversationModel
            .find({ $or: [{ user1Id: userId }, { user2Id: userId }] })
            .sort({ lastMessageAt: -1 })
            .lean();
        return docs.map(d => ConversationInfraMapper.toDomain(d as ConversationDocument));
    }

    async updateLastMessage(
        conversationId: string,
        lastMessageAt: Date,
        lastMessageBy: string,
    ): Promise<ConversationEntity | null> {
        const doc = await ConversationModel.findByIdAndUpdate(
            conversationId,
            { $set: { lastMessageAt, lastMessageBy } },
            { new: true },
        ).lean();
        if (!doc) return null;
        return ConversationInfraMapper.toDomain(doc as ConversationDocument);
    }
}