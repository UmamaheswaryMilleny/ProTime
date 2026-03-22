import type { ConversationResponseDTO } from "../../../dto/chat/response/conversation.response.dto";

export interface IGetConversationsUsecase {
    execute(userId: string): Promise<ConversationResponseDTO[]>;
}