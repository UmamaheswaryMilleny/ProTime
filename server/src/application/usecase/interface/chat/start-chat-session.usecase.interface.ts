import type { StartChatSessionRequestDTO } from '../../../dto/chat/request/start-chat-session.request.dto';
import type { ChatSessionResponseDTO } from '../../../dto/chat/response/chat-session.response.dto';

export interface IStartChatSessionUsecase {
    execute(
        userId: string,
        conversationId: string,
        dto: StartChatSessionRequestDTO,
    ): Promise<ChatSessionResponseDTO>;
}