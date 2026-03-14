import { inject, injectable } from 'tsyringe';
import type { IGetMessagesUsecase } from '../../interface/community-chat/get-messages.usecase.interface';
import type { ICommunityMessageRepository }  from '../../../../domain/repositories/community/community.repository.interface';
import type { IUserRepository }              from '../../../../domain/repositories/user/user.repository.interface';
import type { GetMessagesResponseDTO } from '../../../dto/community-chat/response/get-messages.response.dto';
import type { GetMessagesRequestDTO } from '../../../dto/community-chat/request/get-messages.request.dto';
import { CommunityMapper } from '../../../mapper/community.mapper';

@injectable()
export class GetMessagesUsecase implements IGetMessagesUsecase {
  constructor(
    @inject('ICommunityMessageRepository')
    private readonly communityRepo: ICommunityMessageRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: GetMessagesRequestDTO): Promise<GetMessagesResponseDTO> {

    // 1. Parse cursor — before is ISO string from client
    const before = dto.before ? new Date(dto.before) : undefined;

    // 2. Fetch limit+1 to detect hasMore without extra countDocuments call
    const raw = await this.communityRepo.findMessages({
      limit:  dto.limit + 1,
      before,
    });

    // 3. Detect if more messages exist
    const hasMore  = raw.length > dto.limit;
    const messages = hasMore ? raw.slice(0, dto.limit) : raw;

    // 4. Parallel fetch all senders
    const userIds = messages.map(m => m.userId);
    const users   = await Promise.all(userIds.map(id => this.userRepo.findById(id)));

    // 5. Map — null guard with 'Deleted User' fallback
    const mapped = messages.map((msg, i) => {
      const user = users[i] ?? { id: msg.userId, fullName: 'Deleted User' };
      return CommunityMapper.toResponse(msg, user);
    });

    return { messages: mapped, hasMore };
  }
}