import type { ChatSessionResponseDTO } from "../../../dto/chat/response/chat-session.response.dto";

export interface IEndChatSessionUsecase {
    execute(
        userId: string,
        conversationId: string,
    ): Promise<ChatSessionResponseDTO>;
}