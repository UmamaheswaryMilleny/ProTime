import type { SendMessageRequestDTO } from '../../../dto/community-chat/request/send-message.request.dto';
import type { CommunityChatResponseDTO } from '../../../dto/community-chat/response/community-chat.response.dto';

export interface ISendMessageUsecase {
  execute(
    userId: string,
    dto:    SendMessageRequestDTO,
  ): Promise<CommunityChatResponseDTO>;
}