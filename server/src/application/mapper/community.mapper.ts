import type { CommunityChatEntity } from '../../domain/entities/community.entity';
import type { UserEntity } from '../../domain/entities/user.entity';
import type { CommunityChatResponseDTO } from '../dto/community-chat/response/community-chat.response.dto';

export class CommunityMapper {
  static toResponse(
    entity: CommunityChatEntity,
    user:   Pick<UserEntity, 'id' | 'fullName'>,
  ): CommunityChatResponseDTO {
    return {
      id:        entity.id,
      userId:    entity.userId,
      fullName:  user.fullName,
      content:   entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}