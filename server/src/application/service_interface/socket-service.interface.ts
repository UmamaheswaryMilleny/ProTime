
import { CommunityChatResponseDTO } from "../dto/community-chat/response/community-chat.response.dto";

export interface ISocketService {
  emitNewMessage(message: CommunityChatResponseDTO): void;
}