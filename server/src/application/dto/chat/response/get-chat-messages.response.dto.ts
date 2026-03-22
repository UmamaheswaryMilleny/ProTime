import type { DirectMessageResponseDTO } from './direct-message.response.dto';

export interface GetChatMessagesResponseDTO {
    messages: DirectMessageResponseDTO[];
    hasMore: boolean;
}