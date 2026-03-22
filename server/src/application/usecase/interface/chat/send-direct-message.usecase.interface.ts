import type { SendDirectMessageRequestDTO } from '../../../dto/chat/request/send-direct-message.request.dto';
import type { DirectMessageResponseDTO } from '../../../dto/chat/response/direct-message.response.dto';

export interface ISendDirectMessageUsecase {
    execute(
        senderId: string,
        conversationId: string,
        dto: SendDirectMessageRequestDTO,
    ): Promise<DirectMessageResponseDTO>;
}