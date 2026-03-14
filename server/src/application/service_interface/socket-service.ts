// application/service_interface/socket.service.interface.ts
import { CommunityChatResponseDTO } from "../dto/community-chat/response/community-chat.response.dto";

export interface ISocketService {
  // Broadcast a new message to all connected users in the community room
  emitNewMessage(message: CommunityChatResponseDTO): void;
}