import type { CommunityChatResponseDTO } from './community-chat.response.dto';

export interface GetMessagesResponseDTO {
  messages: CommunityChatResponseDTO[];
  hasMore: boolean; //
  monthlyCount?: number;
}