import type { GetChatMessagesRequestDTO } from '../../../dto/chat/request/get-chat-messages.request.dto';
import type { GetChatMessagesResponseDTO } from '../../../dto/chat/response/get-chat-messages.response.dto';

export interface IGetMessagesUsecase {
    execute(
        userId: string,
        conversationId: string,
        dto: GetChatMessagesRequestDTO,
    ): Promise<GetChatMessagesResponseDTO>;
}