import { inject, injectable } from 'tsyringe';
import type { IGetMessagesUsecase } from '../../interface/community-chat/get-messages.usecase.interface';
import type { ICommunityMessageRepository } from '../../../../domain/repositories/community/community.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user/user.repository.interface';
import type { GetMessagesResponseDTO } from '../../../dto/community-chat/response/get-messages.response.dto';
import type { GetMessagesRequestDTO } from '../../../dto/community-chat/request/get-messages.request.dto';
import { CommunityMapper } from '../../../mapper/community.mapper';
import { UserEntity } from '../../../../domain/entities/user.entity';

@injectable()
export class GetMessagesUsecase implements IGetMessagesUsecase {
  constructor(
    @inject('ICommunityMessageRepository')
    private readonly communityRepo: ICommunityMessageRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) { }

  async execute(userId: string | undefined, dto: GetMessagesRequestDTO): Promise<GetMessagesResponseDTO> {

    //A cursor is a bookmark — it marks where you are in a list so you can load the next chunk from that exact point
    // 1. Parse cursor — before is ISO string from client
    const before = dto.before ? new Date(dto.before) : undefined; //undefined → get latest messages

    // 2. Fetch limit+1 to detect hasMore without extra countDocuments call
    const raw = await this.communityRepo.findMessages({
      //Fetches one extra message than requested. This is a trick to check if more messages exist without running a separate `countDocuments` query:
      limit: dto.limit + 1,
      before,
    });

    // 3. Detect if more messages exist
    const hasMore = raw.length > dto.limit;
    const messages = hasMore ? raw.slice(0, dto.limit) : raw;

    // 4. Parallel fetch all senders
    const userIds = messages.map(m => m.userId);
    //fetches all 20 users simultaneously
    const users = await Promise.all(userIds.map(id => this.userRepo.findById(id)));

    // 5. Map — null guard with 'Deleted User' fallback
    const mapped = messages.map((msg, i) => {
      const user = users[i] ?? { id: msg.userId, fullName: 'Deleted User' } as Pick<UserEntity, 'id' | 'fullName'>;
      return CommunityMapper.toResponse(msg, user);
    });

    let monthlyCount: number | undefined;
    if (userId) {
      monthlyCount = await this.communityRepo.countMonthlyMessages(userId);
    }

    return { messages: mapped, hasMore, monthlyCount };
  }
}