import { inject, injectable } from 'tsyringe';
import type { ISendMessageUsecase } from '../../interface/community-chat/send-message.usecase.interface';
import type { ICommunityMessageRepository }   from '../../../../domain/repositories/community/community.repository.interface';
import type { IUserRepository }               from '../../../../domain/repositories/user/user.repository.interface';
import type { SendMessageRequestDTO } from '../../../dto/community-chat/request/send-message.request.dto';
import type { CommunityChatResponseDTO } from '../../../dto/community-chat/response/community-chat.response.dto';
import {
  CommunityMessageLimitError,
  EmptyMessageContentError,
} from '../../../../domain/errors/community.errors';
import { CommunityMapper } from '../../../mapper/community.mapper';
import { FREE_MONTHLY_COMMUNITY_MESSAGES } from '../../../../shared/constants/constants';
import type { ISocketService } from '../../../service_interface/socket-service.interface';


@injectable()
export class SendMessageUsecase implements ISendMessageUsecase {
  constructor(
    @inject('ICommunityMessageRepository')
    private readonly communityRepo: ICommunityMessageRepository,

    @inject('IUserRepository')
    private readonly userRepo: IUserRepository,

    @inject('ISocketService')
    private readonly socketService: ISocketService,
  ) {}

  async execute(
    userId: string,
    dto:    SendMessageRequestDTO,
  ): Promise<CommunityChatResponseDTO> {

    const content = dto.content.trim();
    if (!content) throw new EmptyMessageContentError();

    const user      = await this.userRepo.findById(userId);
    const isPremium = user?.isPremium ?? false;

    if (!isPremium) {
      const monthlyCount = await this.communityRepo.countMonthlyMessages(userId);
      if (monthlyCount >= FREE_MONTHLY_COMMUNITY_MESSAGES) {
        throw new CommunityMessageLimitError();
      }
    }

    const saved  = await this.communityRepo.save({ userId, content });
    const sender = user ?? { id: userId, fullName: 'Deleted User' };
    const response = CommunityMapper.toResponse(saved, sender);

    // Broadcast to all connected clients in real time
    this.socketService.emitNewMessage(response);

    return response;
  }
}