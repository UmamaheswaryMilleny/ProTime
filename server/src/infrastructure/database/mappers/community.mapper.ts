import type { CommunityChatDocument } from '../models/community.model';
import type { CommunityChatEntity } from '../../../domain/entities/community.entity';

export class CommunityChatInfraMapper {

  static toDomain(doc: CommunityChatDocument): CommunityChatEntity {
    return {
      id:        doc._id.toString(),
      userId:    doc.userId.toString(),
      content:   doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}