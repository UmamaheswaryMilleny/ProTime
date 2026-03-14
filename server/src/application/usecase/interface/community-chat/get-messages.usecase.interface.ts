import type { GetMessagesRequestDTO } from '../../../dto/community-chat/request/get-messages.request.dto';
import type { GetMessagesResponseDTO } from '../../../dto/community-chat/response/get-messages.response.dto';

export interface IGetMessagesUsecase {
  execute(dto: GetMessagesRequestDTO): Promise<GetMessagesResponseDTO>;
}