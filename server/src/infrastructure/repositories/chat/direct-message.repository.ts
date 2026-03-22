import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { DirectMessageModel, DirectMessageDocument } from '../../database/models/direct-message.model';
import { DirectMessageInfraMapper } from '../../database/mappers/direct-message.infra.mapper';
import type { IDirectMessageRepository } from '../../../domain/repositories/chat/direct-message.repository.interface';
import type { DirectMessageEntity } from '../../../domain/entities/chat.entities';
import { MessageStatus } from '../../../domain/enums/chat.enums'; // ← import type removed, need value

@injectable()
export class DirectMessageRepository
    extends BaseRepository<DirectMessageDocument, DirectMessageEntity>
    implements IDirectMessageRepository {
    constructor() {
        super(DirectMessageModel, DirectMessageInfraMapper.toDomain);
    }

    async findByConversationId(params: {
        conversationId: string;
        limit: number;
        before?: Date;
    }): Promise<DirectMessageEntity[]> {
        const query: Record<string, unknown> = {
            conversationId: params.conversationId,
        };
        if (params.before) {
            query.createdAt = { $lt: params.before };
        }

        const docs = await DirectMessageModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(params.limit)
            .lean();

        return docs.map(d => DirectMessageInfraMapper.toDomain(d as DirectMessageDocument));
    }

    async countUnread(
        conversationId: string,
        userId: string,
    ): Promise<number> {
        return DirectMessageModel.countDocuments({
            conversationId,
            senderId: { $ne: userId, $nin: [null] }, // ← exclude own + system messages
            status: { $ne: MessageStatus.READ },   // ← enum instead of string
        });
    }

    async updateStatus(
        messageId: string,
        status: MessageStatus,
        readAt?: Date,
    ): Promise<DirectMessageEntity | null> {
        const update: Record<string, unknown> = { status };
        if (readAt) update.readAt = readAt;

        const doc = await DirectMessageModel.findByIdAndUpdate(
            messageId,
            { $set: update },
            { new: true },
        ).lean();

        if (!doc) return null;
        return DirectMessageInfraMapper.toDomain(doc as DirectMessageDocument);
    }

    async markAllAsRead(
        conversationId: string,
        receiverId: string,
    ): Promise<void> {
        await DirectMessageModel.updateMany(
            {
                conversationId,
                senderId: { $ne: receiverId, $nin: [null] }, // ← exclude own + system messages
                status: { $ne: MessageStatus.READ },       // ← enum instead of string
            },
            {
                $set: {
                    status: MessageStatus.READ, // ← enum instead of string
                    readAt: new Date(),
                },
            },
        );
    }
}