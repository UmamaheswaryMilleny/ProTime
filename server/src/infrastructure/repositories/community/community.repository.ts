import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { CommunityChatModel, CommunityChatDocument } from '../../database/models/community.model';
import { CommunityChatInfraMapper } from '../../database/mappers/community.mapper';
import type { ICommunityMessageRepository } from '../../../domain/repositories/community/community.repository.interface';
import type { CommunityChatEntity } from '../../../domain/entities/community.entity';

@injectable()
export class CommunityMessageRepository
  extends BaseRepository<CommunityChatDocument, CommunityChatEntity>
  implements ICommunityMessageRepository
{
  constructor() {
    super(CommunityChatModel, CommunityChatInfraMapper.toDomain);
  }

  // Cursor-based pagination — returns messages older than `before`, newest first
  // Client reverses array for display (oldest top, newest bottom)
  async findMessages(params: {
    limit:   number;
    before?: Date;
  }): Promise<CommunityChatEntity[]> {
    const query: Record<string, unknown> = {};
    if (params.before) {
      query.createdAt = { $lt: params.before };
    }

    const docs = await CommunityChatModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(params.limit)
      .lean();

    return docs.map(d => CommunityChatInfraMapper.toDomain(d as CommunityChatDocument));
  }

  // Rolling 30-day window — free user quota check on every send
  async countMonthlyMessages(userId: string): Promise<number> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return CommunityChatModel.countDocuments({
      userId,
      createdAt: { $gte: since },
    });
  }
}